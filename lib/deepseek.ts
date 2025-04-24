import { env } from "process";

// Type definitions
type JobRecommendation = {
  title: string;
  company: string;
  location: string;
  skills: string;
  salary: string;
  description: string;
  url: string | undefined;
};

type CourseRecommendation = {
  title: string;
  provider: string;
  location: string;
  skills: string;
  duration: string;
  benefits: string;
  url: string | undefined;
};

type Recommendation = JobRecommendation | CourseRecommendation;

// Simple in-memory cache
const aiCache = new Map<string, { data: { items: Recommendation[] }; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

export async function getAIRecommendations(type: "job" | "course", skills: string[], location: string) {
  const cacheKey = `ai-${type}-${skills.join(",")}-${location}`;

  // Check cache first
  const cachedData = aiCache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    console.log("Returning cached data for:", cacheKey);
    return cachedData.data;
  }

  let systemPrompt = "";
  let userPrompt = "";

  if (type === "job") {
    systemPrompt = `You are a professional career advisor specializing in the Kenyan job market. 
    Provide exactly 6 job recommendations in the following structured format, with each field on a new line:
    1. Job title: <clear and specific professional title>
       Company: <real Kenyan company>
       Location: <specific Kenyan location>
       Required skills: <relevant skills>
       Estimated salary range: <realistic salary in Kenyan Shillings>
       Brief job description: <2-3 sentences describing the job>
       URL: <plausible job listing URL, e.g., brightermonday.co.ke, fuzu.com, or company career page>
    2. Job title: <title>
       ...
    Ensure each recommendation has all fields filled with real, Kenya-specific data. 
    Use the exact labels (e.g., "Job title:", "Company:") and do not include empty or incomplete entries.`;
    userPrompt = `Based on these skills: ${skills.join(", ")} and location: ${location} in Kenya, recommend suitable jobs with the details requested.`;
  } else {
    systemPrompt = `You are a professional education advisor specializing in the Kenyan education and training landscape.
    Provide exactly 6 course recommendations in the following structured format, with each field on a new line:
    1. Course title: <specific professional course title, unique for each recommendation>
       Provider: <real Kenyan institution or online platform>
       Location: <in-person Kenyan location or "Online">
       Skills gained: <specific skills taught>
       Duration: <realistic timeframe, e.g., "8 weeks">
       Brief description of benefits: <2-3 sentences describing benefits>
       URL: <plausible course URL, e.g., institution website, coursera.org, edx.org>
    2. Course title: <title>
       ...
    Ensure each recommendation has all fields filled with realistic, Kenya-specific data. 
    Use the exact labels (e.g., "Course title:", "Provider:") and do not include empty or incomplete entries.`;
    userPrompt = `Based on these skills: ${skills.join(", ")} and location: ${location} in Kenya, recommend suitable courses with the details requested.`;
  }

  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      if (!env.DEEPSEEK_API) {
        console.error("Missing API key: DEEPSEEK_API environment variable is not set");
        throw new Error("DeepSeek API key is not configured");
      }

      console.log("Making DeepSeek API request:", { type, skills, location, attempt: retries + 1 });

      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.DEEPSEEK_API}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1500, // Increased to accommodate 6 recommendations
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API HTTP error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });

        if (response.status === 401) {
          throw new Error("Unauthorized: Invalid DeepSeek API key");
        } else if (response.status === 429) {
          console.warn("Rate limit exceeded, retrying after delay...");
          retries++;
          if (retries >= MAX_RETRIES) {
            throw new Error("Rate limit exceeded: Too many requests to DeepSeek API");
          }
          await new Promise((resolve) => setTimeout(resolve, 1000 * (retries + 1)));
          continue;
        } else if (response.status >= 500) {
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        } else {
          throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log("DeepSeek API response:", data);

      if (!data.choices?.[0]?.message?.content) {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format from DeepSeek API: Missing choices or content");
      }

      const content = data.choices[0].message.content;
      console.log("Raw API response content:", content);

      const recommendations = parseRecommendations(content, type);
      console.log("Parsed recommendations:", recommendations.items);

      const validRecommendations = recommendations.items.filter((item) => {
        if (type === "job") {
          const job = item as JobRecommendation;
          const isValid = job.title && job.company && job.location && job.skills && job.salary && job.description && job.url;
          if (!isValid) {
            console.warn("Invalid job recommendation:", job);
          }
          return isValid;
        } else {
          const course = item as CourseRecommendation;
          const isValid = course.title && course.provider && course.location && course.skills && course.duration && course.benefits && course.url;
          if (!isValid) {
            console.warn("Invalid course recommendation:", course);
          }
          return isValid;
        }
      });

      console.log("Valid recommendations:", validRecommendations);

      if (validRecommendations.length === 0) {
        console.warn("No valid recommendations parsed from API response");
        throw new Error("No valid recommendations could be parsed from the API response");
      }

      // Ensure exactly 6 recommendations (truncate or warn if fewer)
      if (validRecommendations.length < 6) {
        console.warn(`Only ${validRecommendations.length} valid recommendations found, expected 6`);
      }
      if (validRecommendations.length > 6) {
        validRecommendations.length = 6; // Truncate to 6
        console.log("Truncated to 6 recommendations:", validRecommendations);
      }

      aiCache.set(cacheKey, {
        data: { items: validRecommendations },
        timestamp: Date.now(),
      });

      return { items: validRecommendations };
    } catch (error: any) {
      console.error("Error getting AI recommendations:", error);

      if (error.message.includes("DeepSeek API key is not configured")) {
        console.error("Configuration error: Please set DEEPSEEK_API in your environment variables");
        return type === "job" ? getDefaultJobs() : getDefaultCourses();
      } else if (error.message.includes("Unauthorized")) {
        console.error("Authentication error: Verify your DeepSeek API key");
        return type === "job" ? getDefaultJobs() : getDefaultCourses();
      } else if (error.message.includes("Rate limit exceeded")) {
        console.error("Rate limit error: Retries exhausted, returning defaults");
        return type === "job" ? getDefaultJobs() : getDefaultCourses();
      } else if (error.code === "ENOTFOUND") {
        console.error("DNS error: Unable to resolve api.deepseek.com. Check network or endpoint");
        return type === "job" ? getDefaultJobs() : getDefaultCourses();
      } else if (error.message.includes("Invalid response format")) {
        console.error("Response error: DeepSeek API returned invalid or empty data");
        return type === "job" ? getDefaultJobs() : getDefaultCourses();
      } else if (error.message.includes("No valid recommendations")) {
        console.error("Parsing error: Could not parse valid recommendations from API response");
        return type === "job" ? getDefaultJobs() : getDefaultCourses();
      } else if (error.message.includes("Server error")) {
        console.error("Server error: DeepSeek API is unavailable or returned a server error");
        return type === "job" ? getDefaultJobs() : getDefaultCourses();
      } else {
        console.error("Unexpected error:", error.message);
        return type === "job" ? getDefaultJobs() : getDefaultCourses();
      }
    }
  }

  console.error("All retries failed, returning defaults");
  return type === "job" ? getDefaultJobs() : getDefaultCourses();
}

function parseRecommendations(content: string, type: "job" | "course"): { items: Recommendation[] } {
  const items: Recommendation[] = [];
  const sections = content.split(/\n?\s*\d+\.\s+/).filter(Boolean);
  console.log("Parsed sections:", sections);

  for (const section of sections) {
    if (type === "job") {
      const job: JobRecommendation = {
        title: extractField(section, ["Job title:", "Title:", "Position:", "Job:"], ""),
        company: extractField(section, ["Company:", "Organization:", "Employer:"], ""),
        location: extractField(section, ["Location:", "Place:", "Area:", "City:"], ""),
        skills: extractField(section, ["Required skills:", "Skills:", "Skills required:", "Competencies:"], ""),
        salary: extractField(section, ["Estimated salary:", "Salary:", "Salary range:", "Compensation:"], ""),
        description: extractField(section, ["Description:", "Job description:", "Brief description:", "Details:"], ""),
        url: ensureValidUrl(extractField(section, ["URL:", "Link:", "Website:", "Apply at:"], "")),
      };

      if (Object.values(job).every((value) => value && value.trim() !== "")) {
        items.push(job);
      } else {
        console.warn("Skipping invalid job recommendation due to missing fields:", job);
      }
    } else {
      const course: CourseRecommendation = {
        title: extractField(section, ["Course title:", "Title:", "Course:", "Program:"], ""),
        provider: extractField(section, ["Provider:", "Institution:", "Offered by:", "School:"], ""),
        location: extractField(section, ["Location:", "Delivery method:", "Mode:", "Place:"], ""),
        skills: extractField(section, ["Skills gained:", "Skills:", "You will learn:", "Learning outcomes:"], ""),
        duration: extractField(section, ["Duration:", "Length:", "Time:", "Period:"], ""),
        benefits: extractField(section, ["Benefits:", "Description:", "Brief description:", "Advantages:"], ""),
        url: ensureValidUrl(extractField(section, ["URL:", "Link:", "Website:", "Enroll at:"], "")),
      };

      if (Object.values(course).every((value) => value && value.trim() !== "")) {
        items.push(course);
      } else {
        console.warn("Skipping invalid course recommendation due to missing fields:", course);
      }
    }
  }

  return { items };
}

function extractField(text: string, possibleLabels: string[], defaultValue: string): string {
  for (const label of possibleLabels) {
    const regex = new RegExp(`^${label}\\s*([^\\n]+)`, "im");
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  const lines = text.split("\n");
  for (const line of lines) {
    for (const label of possibleLabels) {
      if (line.toLowerCase().includes(label.toLowerCase().replace(":", ""))) {
        const value = line.substring(line.indexOf(":") + 1).trim();
        if (value) return value;
      }
    }
  }

  for (const line of lines) {
    if (line.includes(":")) {
      const value = line.split(":").slice(1).join(":").trim();
      if (value) return value;
    }
  }

  console.warn(`Failed to extract field for labels: ${possibleLabels.join(", ")}`);
  return defaultValue;
}

function ensureValidUrl(url?: string): string | undefined {
  if (!url) return undefined;

  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.protocol) {
      return `https://${url}`;
    }
    return url;
  } catch (e) {
    try {
      if (url.includes(".") && !url.includes(" ")) {
        return `https://${url}`;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }
}

function getDefaultJobs() {
  return {
    items: [
      {
        title: "Software Developer",
        company: "Tech Solutions Kenya",
        location: "Nairobi, Kenya",
        skills: "JavaScript, React, Node.js, MongoDB",
        salary: "KSh 80,000 - 120,000 per month",
        description: "Develop and maintain web applications for clients across various industries in Kenya.",
        url: "https://www.brightermonday.co.ke/jobs/software-development/nairobi",
      },
      {
        title: "Digital Marketing Specialist",
        company: "Savannah Media",
        location: "Mombasa, Kenya",
        skills: "SEO, Social Media Marketing, Content Creation, Analytics",
        salary: "KSh 60,000 - 90,000 per month",
        description: "Create and implement digital marketing strategies for businesses in the tourism sector.",
        url: "https://www.fuzu.com/kenya/jobs/marketing",
      },
      {
        title: "Project Manager",
        company: "Buildright Construction",
        location: "Kisumu, Kenya",
        skills: "Project Planning, Budgeting, Team Leadership, MS Project",
        salary: "KSh 100,000 - 150,000 per month",
        description: "Oversee construction projects from inception to completion, ensuring quality and timeliness.",
        url: "https://www.linkedin.com/jobs/project-manager-jobs-kenya",
      },
      {
        title: "Data Analyst",
        company: "Insight Analytics Kenya",
        location: "Nairobi, Kenya",
        skills: "SQL, Python, Data Visualization, Statistical Analysis",
        salary: "KSh 70,000 - 110,000 per month",
        description: "Analyze complex datasets to provide actionable insights for business decision-making.",
        url: "https://www.brightermonday.co.ke/jobs/data-analysis/nairobi",
      },
      {
        title: "Human Resources Officer",
        company: "East Africa Breweries",
        location: "Nairobi, Kenya",
        skills: "Recruitment, Employee Relations, HR Policies, Training",
        salary: "KSh 65,000 - 95,000 per month",
        description: "Manage recruitment processes and employee relations for a large manufacturing company.",
        url: "https://www.fuzu.com/kenya/jobs/human-resources",
      },
      {
        title: "Network Administrator",
        company: "Airtel Kenya",
        location: "Nairobi, Kenya",
        skills: "Network Configuration, Cybersecurity, Cisco Systems, Troubleshooting",
        salary: "KSh 85,000 - 130,000 per month",
        description: "Manage and secure enterprise network infrastructure to ensure reliable connectivity.",
        url: "https://www.brightermonday.co.ke/jobs/network-administrator/nairobi",
      },
    ],
  };
}

function getDefaultCourses() {
  return {
    items: [
      {
        title: "Full Stack Web Development Bootcamp",
        provider: "Moringa School",
        location: "Nairobi, Kenya & Online",
        skills: "HTML, CSS, JavaScript, React, Node.js, MongoDB",
        duration: "16 weeks",
        benefits:
          "Gain comprehensive skills in both frontend and backend development with hands-on projects and career support.",
        url: "https://moringaschool.com/courses/software-development/",
      },
      {
        title: "Digital Marketing Certification",
        provider: "eMobilis Technology Institute",
        location: "Nairobi, Kenya",
        skills: "SEO, Social Media Marketing, Google Analytics, Content Strategy",
        duration: "8 weeks",
        benefits:
          "Learn practical digital marketing skills with real campaign experience and industry-recognized certification.",
        url: "https://emobilis.ac.ke/courses/digital-marketing/",
      },
      {
        title: "Data Science and Machine Learning",
        provider: "Coursera - IBM Partnership",
        location: "Online",
        skills: "Python, Data Analysis, Statistical Methods, Machine Learning Algorithms",
        duration: "6 months",
        benefits:
          "Master data science fundamentals with IBM's industry-leading curriculum and earn a recognized certificate.",
        url: "https://www.coursera.org/professional-certificates/ibm-data-science",
      },
      {
        title: "Project Management Professional (PMP) Preparation",
        provider: "Kenya Institute of Management",
        location: "Nairobi & Online",
        skills: "Project Planning, Risk Management, Stakeholder Communication, PMP Exam Preparation",
        duration: "12 weeks",
        benefits: "Prepare for the globally recognized PMP certification with expert guidance and practice exams.",
        url: "https://kim.ac.ke/professional-courses/project-management/",
      },
      {
        title: "UI/UX Design Fundamentals",
        provider: "Africa Digital Media Institute",
        location: "Nairobi, Kenya",
        skills: "User Research, Wireframing, Prototyping, Figma, Adobe XD",
        duration: "10 weeks",
        benefits:
          "Build a professional design portfolio while learning the principles of creating user-centered digital experiences.",
        url: "https://admi.ac.ke/course/ui-ux-design/",
      },
      {
        title: "Cybersecurity Essentials",
        provider: "Strathmore University",
        location: "Nairobi, Kenya & Online",
        skills: "Network Security, Ethical Hacking, Risk Assessment, Cryptography",
        duration: "12 weeks",
        benefits:
          "Learn to protect systems from cyber threats with practical training and earn a certificate from a reputable institution.",
        url: "https://www.strathmore.edu/course/cybersecurity-essentials/",
      },
    ],
  };
}