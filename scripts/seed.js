const fs = require('fs');
const path = require('path');
const { pool } = require('../db');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Beginning database seeding...');
    await client.query('BEGIN');

    // Clear existing data
    await client.query('TRUNCATE profiles, skill_categories, skills, experiences, projects, education, certifications, "references", publications CASCADE');

    // Read resume.md for raw_markdown
    const resumeMdPath = path.join(__dirname, '..', 'resume.md');
    const rawMarkdown = fs.existsSync(resumeMdPath) ? fs.readFileSync(resumeMdPath, 'utf8') : '';

    // 1. Seed Profile
    const profileSummary = [
      "My journey in software development has been driven by a relentless curiosity and a passion for turning ideas into reality. What started as a Computer Science degree quickly grew into a multifaceted career, beginning with roles in data analysis and GIS, where I learned the importance of precision and structure. This foundation paved the way for my transition into full-stack development.",
      "I have spent years honing my skills, building a deep expertise in PHP frameworks like Laravel and CodeIgniter, as well as content management systems like WordPress and Drupal. I've had the privilege of developing a wide array of solutions, including e-commerce platforms, custom client websites, and critical modules for Point of Sale (POS) systems covering everything from authentication to item management.",
      "Now, as a Technical Lead, I apply this broad experience to guide complex projects, most notably leading the successful API integration of a major client. I am just as comfortable architecting a backend system as I am implementing a UI, assisting with DevOps, or resolving a critical production issue."
    ];

    const profileExpertise = [
      { title: "Full-Stack Development", desc: "End-to-end creation of scalable web applications, RESTful services, and modern responsive interfaces." },
      { title: "API Integration", desc: "Connecting disparate systems, designing high-throughput transaction proxies, and seamless enterprise workflows." },
      { title: "Backend Systems", desc: "Building mission-critical business logic for POS, subscription e-commerce, and SaaS platforms." },
      { title: "Versatile Technologies", desc: "Deep proficiency across PHP (Laravel, CodeIgniter), Python, Node.js, relational databases, and modern cloud tooling." },
      { title: "Problem Solving & Architecture", desc: "Diagnosing production bottlenecks, optimizing SQL queries, and architecting resilient microservices." }
    ];

    const profileStats = [
      { label: "Years Experience", value: "11+" },
      { label: "Projects Delivered", value: "40+" },
      { label: "Tech Stack Breadth", value: "25+" },
      { label: "API Integrations", value: "15+" }
    ];

    await client.query(`
      INSERT INTO profiles (
        name, initials, tagline, location, address, phone, email,
        linkedin_url, github_url, website_url, status_text, status_available,
        summary_paragraphs, expertise, stats, raw_markdown
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `, [
      "Fil Joseph Elman",
      "FE",
      "Technical Lead • Full-Stack Developer • API Integration • PHP • Python • IoT • Artificial Intelligence",
      "Davao, Davao Region, Philippines",
      "Lot 32, Block 8, Fori St, Navonna Subd., Davao City, Davao Region, Philippines",
      "+63 912 491 8787",
      "filjoseph22@gmail.com",
      "https://linkedin.com/in/filjoseph",
      "https://github.com/filjoseph1989",
      "https://filjoseph1989.github.io",
      "Available for Technical Leadership & Full-Stack Roles",
      true,
      JSON.stringify(profileSummary),
      JSON.stringify(profileExpertise),
      JSON.stringify(profileStats),
      rawMarkdown
    ]);

    // 2. Seed Skill Categories and Skills
    const skillCategories = [
      {
        name: "Backend & Languages",
        slug: "backend",
        icon: "server",
        skills: [
          { name: "PHP", years: "11 yrs" },
          { name: "JavaScript", years: "11 yrs" },
          { name: "Node.js", years: "6 yrs" },
          { name: "Python", years: "1 yr" },
          { name: "Java", years: null },
          { name: "TypeScript", years: "<1 yr" },
          { name: "Express.js", years: "<1 yr" }
        ]
      },
      {
        name: "Frontend & Frameworks",
        slug: "frontend",
        icon: "layout",
        skills: [
          { name: "HTML", years: "11 yrs" },
          { name: "CSS", years: "11 yrs" },
          { name: "ReactJS", years: "3 yrs" },
          { name: "Tailwind CSS", years: "3 yrs" },
          { name: "Bootstrap", years: null },
          { name: "jQuery", years: null },
          { name: "Next.js", years: null },
          { name: "Nuxt.js", years: null },
          { name: "Svelte", years: "<1 yr" },
          { name: "Remix", years: "<1 yr" }
        ]
      },
      {
        name: "Frameworks, CMS & Starter Kits",
        slug: "frameworks-cms",
        icon: "layers",
        skills: [
          { name: "Laravel", years: null },
          { name: "CodeIgniter", years: null },
          { name: "WordPress", years: null },
          { name: "Drupal", years: null },
          { name: "Laraship", years: null }
        ]
      },
      {
        name: "Databases & Infrastructure",
        slug: "databases-infra",
        icon: "database",
        skills: [
          { name: "MySQL", years: "7 yrs" },
          { name: "PostgreSQL", years: "3 yrs" },
          { name: "Git", years: "11 yrs" },
          { name: "Ubuntu / Linux", years: "11 yrs" },
          { name: "Apache", years: "11 yrs" },
          { name: "Docker", years: null },
          { name: "Rsync", years: null }
        ]
      },
      {
        name: "Specializations",
        slug: "specializations",
        icon: "cpu",
        skills: [
          { name: "Artificial Intelligence (AI)", years: null },
          { name: "API Integration", years: null },
          { name: "IoT", years: null },
          { name: "GIS (ArcGIS)", years: null }
        ]
      },
      {
        name: "CRM & Project Management",
        slug: "crm-pm",
        icon: "briefcase",
        skills: [
          { name: "Jira", years: null },
          { name: "HubSpot", years: null },
          { name: "Salesforce", years: null },
          { name: "Trello", years: null },
          { name: "Asana", years: null },
          { name: "ClickUp", years: null },
          { name: "Notion", years: null },
          { name: "Linear", years: null },
          { name: "Zendesk", years: null }
        ]
      },
      {
        name: "Communication & Collaboration",
        slug: "collaboration",
        icon: "message-square",
        skills: [
          { name: "Slack", years: null },
          { name: "Microsoft Teams", years: null },
          { name: "Discord", years: null },
          { name: "Zoom", years: null },
          { name: "Google Workspace", years: null },
          { name: "Loom", years: null }
        ]
      },
      {
        name: "Libraries, Media & Design",
        slug: "media-design",
        icon: "image",
        skills: [
          { name: "ImageMagick", years: null },
          { name: "Apache PDFBox", years: null },
          { name: "Adobe Photoshop", years: "11 yrs" },
          { name: "DaVinci Resolve", years: "<1 yr" }
        ]
      },
      {
        name: "Languages",
        slug: "languages",
        icon: "globe",
        skills: [
          { name: "Tagalog", years: "Native" },
          { name: "English", years: "Professional Working" }
        ]
      }
    ];

    for (let cIdx = 0; cIdx < skillCategories.length; cIdx++) {
      const cat = skillCategories[cIdx];
      const catRes = await client.query(`
        INSERT INTO skill_categories (name, slug, icon, display_order)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [cat.name, cat.slug, cat.icon, cIdx]);

      const catId = catRes.rows[0].id;
      for (let sIdx = 0; sIdx < cat.skills.length; sIdx++) {
        const sk = cat.skills[sIdx];
        await client.query(`
          INSERT INTO skills (category_id, name, years_experience, display_order)
          VALUES ($1, $2, $3, $4)
        `, [catId, sk.name, sk.years, sIdx]);
      }
    }

    // 3. Seed Experiences
    const experiences = [
      {
        company: "CreativeX Tech Labs",
        role: "Full Stack Engineer",
        location: "Davao, Philippines",
        employment_type: "Full-time",
        start_date: "June 2025",
        end_date: "Present",
        duration: "1 year 3 months",
        is_current: true,
        description: "Part of the agile core team delivering scalable features and resolving complex technical challenges for a flagship SaaS platform.",
        achievements: [
          "Part of the team responsible for resolving bugs and adding new high-impact features to the Software as a Service (SaaS), multi-tenant application called Value Chain Plus (a Jira competitor).",
          "Architected responsive modular components and integrated low-latency backend APIs.",
          "Optimized PostgreSQL queries and database schemas for high multi-tenant concurrency."
        ],
        technologies: ["ReactJS", "Node.js", "TypeScript", "PostgreSQL", "Docker", "SaaS Multi-tenant"],
        display_order: 0
      },
      {
        company: "Akamai POS",
        role: "Full-stack Developer",
        location: "Honolulu County, Hawaii, United States",
        employment_type: "Contract",
        start_date: "October 2023",
        end_date: "April 2024",
        duration: "7 months",
        is_current: false,
        description: "End-to-end full stack engineering for an enterprise Point of Sale (POS) system serving hospitality and retail merchants.",
        achievements: [
          "Performed end-to-end development of critical modules for a comprehensive Point of Sale (POS) system.",
          "Responsible for architecting and implementing the backend business logic for all newly requested merchant features.",
          "Designed and developed the corresponding frontend pages and interactive user interfaces for each new module.",
          "Delivered core system modules from concept to deployment: Authentication & RBAC session management, Employee Time Tracking & attendance logging, Dynamic Production & Sales Reports, and Full CRUD Item Management with real-time inventory adjustments."
        ],
        technologies: ["CodeIgniter 3", "PostgreSQL", "jQuery", "Bootstrap 3", "PHP", "Session Auth"],
        display_order: 1
      },
      {
        company: "Picture Works Australia",
        role: "Engineer (Integration Lead)",
        location: "Melbourne, Victoria, Australia",
        employment_type: "Full-time",
        start_date: "May 2021",
        end_date: "September 2023",
        duration: "2 years 5 months",
        is_current: false,
        description: "Primary integration lead orchestrating enterprise API pipelines, microservice transaction proxies, and automated image processing infrastructure.",
        achievements: [
          "Served as the primary integration lead and point of contact for a high-priority, strategic client integration.",
          "Led the API integration of the company's largest client into our proprietary software ecosystem.",
          "Architected and developed complex backend functionalities, specifically focusing on submitted order processing, asset ingestion, and queue management.",
          "Performed full-stack development by building and modifying user interface (UI) components related to core backend features in ReactJS.",
          "Provided direct support to the DevOps team with deployment automation, Docker containerization, and Rsync sync routines.",
          "Acted as the senior escalation engineer for diagnosing and resolving critical production incidents."
        ],
        technologies: ["Laravel", "PostgreSQL", "ReactJS", "Docker", "Rsync", "ImageMagick", "PDFBox", "Python"],
        display_order: 2
      },
      {
        company: "uBind",
        role: "Product Developer",
        location: "Melbourne, Victoria, Australia",
        employment_type: "Contract",
        start_date: "June 2020",
        end_date: "February 2021",
        duration: "9 months",
        is_current: false,
        description: "Configured intelligent, dynamic insurance policy application systems powered by rule-based computation engines.",
        achievements: [
          "Utilized structured data modeling as a primary development tool to design and configure dynamic insurance policy application forms.",
          "Structured complex mathematical logic, defining dynamic underwriting questions, multi-factor pricing formulas, and conditional steps based on underwriting rules.",
          "Engineered the logical flow of branching questions to create an intuitive and frictionless user experience for customers purchasing insurance policies.",
          "Configured metadata and schema files for a proprietary platform which automatically generated embeddable web applications."
        ],
        technologies: ["Rule Engines", "Dynamic Forms", "Complex Logic", "Data Modeling", "Formula Engineering"],
        display_order: 3
      },
      {
        company: "Crate Club Group",
        role: "Full-stack Developer",
        location: "New York, United States",
        employment_type: "Full-time",
        start_date: "June 2018",
        end_date: "December 2019",
        duration: "1 year 7 months",
        is_current: false,
        description: "Core full-stack engineer driving pre-launch architecture, payment gateways, and recurring subscription logistics for a high-volume commerce platform.",
        achievements: [
          "Joined the project during its initial development phase prior to its first launch, helping bring the architecture to successful production.",
          "Primarily responsible for developing core backend functionalities and building robust, documented REST APIs.",
          "Engineered recurring billing payment gateways, automated refund processing, and transactional invoice generation.",
          "Implemented comprehensive shipment tracking, third-party logistics API integrations, and fulfillment status pipelines.",
          "Built server-side SEO architecture, structured metadata, and administrative analytics dashboards.",
          "Collaborated closely with mobile app developers to furnish documented REST API endpoints and data contracts."
        ],
        technologies: ["Laravel", "Laraship", "MySQL", "ReactJS", "Tailwind CSS", "Stripe API", "REST APIs"],
        display_order: 4
      },
      {
        company: "IdeaHub IT Solutions Provider, Inc.",
        role: "Full Stack Developer",
        location: "Davao, Davao Region, Philippines",
        employment_type: "Full-time",
        start_date: "May 2017",
        end_date: "February 2018",
        duration: "10 months",
        is_current: false,
        description: "Delivered backend and frontend solutions across diverse international client accounts.",
        achievements: [
          "Backend Developer for Pure Incubation: Implemented and enhanced robust server-side functionalities and API handlers using CodeIgniter 3.",
          "Frontend Developer for Dominoone: Translated bespoke UI/UX designs into pixel-perfect, responsive web interfaces integrated with a Laravel backend."
        ],
        technologies: ["CodeIgniter 3", "Laravel", "MySQL", "JavaScript", "HTML5/CSS3"],
        display_order: 5
      },
      {
        company: "Midtown Printing Corporation, Inc.",
        role: "Programmer / Full Stack Web Developer",
        location: "Bonifacio Street, Davao City, Philippines",
        employment_type: "Full-time",
        start_date: "October 2013",
        end_date: "June 2017",
        duration: "3 years 9 months",
        is_current: false,
        description: "Led digital transformation, custom e-commerce portal development, and internal workflow digitization for Mindanao's leading commercial press.",
        achievements: [
          "Engineered custom WordPress themes and bespoke layouts; executed 3 successful total site redesigns for company milestones.",
          "Replicated a full-featured commercial printing e-commerce platform allowing independent ownership and order workflow management.",
          "Developed customized CodeIgniter web applications for corporate clients including Step-Asia and Aivee Clinic.",
          "Created 'Student Online Services' (SOS) for school yearbook data collection and automated record segregation.",
          "Built automated Revenue Memorandum Circulars document organization system for fiscal compliance.",
          "Planned system architecture for enterprise 'Virtual Office' employee workflow platform on Laravel."
        ],
        technologies: ["PHP", "WordPress", "CodeIgniter", "MySQL", "Bootstrap", "jQuery", "E-commerce"],
        display_order: 6
      },
      {
        company: "Philam Life",
        role: "Financial Advisor",
        location: "Davao, Philippines",
        employment_type: "Full-time",
        start_date: "October 2013",
        end_date: "March 2014",
        duration: "6 months",
        is_current: false,
        description: "Provided financial solutions and assisted personal financial management using services offered by Philam Life.",
        achievements: [
          "Family Secure: Advised clients and tailored comprehensive financial protection, life insurance, and retirement plans for primary household breadwinners.",
          "Education: Structured personalized financial roadmaps and dedicated funding programs for children's future education funds.",
          "Investments & Wealth Management: Guided clients on long-term investment portfolios, wealth accumulation, and asset protection strategies."
        ],
        technologies: ["Banking / Financial Services", "Financial Planning", "Wealth Management", "Marketing", "Public Relations"],
        display_order: 7
      },
      {
        company: "Caraga State University",
        role: "Geographic Information Systems Analyst",
        location: "Butuan, Caraga, Philippines",
        employment_type: "Contract",
        start_date: "February 2013",
        end_date: "July 2013",
        duration: "6 months",
        is_current: false,
        description: "Digitized cadastral and topographic records, produced vector GIS layers, and launched institutional web portal.",
        achievements: [
          "Digitized land titles and aerial survey photos into geospatial vector layers using ArcGIS.",
          "Collaborated on land tenure and parcel spatial data verification across Butuan City.",
          "Built and launched official organizational portal using Drupal CMS."
        ],
        technologies: ["ArcGIS", "Geospatial Data", "Drupal", "PHP", "Cartography"],
        display_order: 8
      },
      {
        company: "Green Pine Agricultural Development Corporation",
        role: "Data Encoder / Analyst",
        location: "Butuan, Caraga, Philippines",
        employment_type: "Full-time",
        start_date: "October 2012",
        end_date: "February 2013",
        duration: "5 months",
        is_current: false,
        description: "Monitored, reconciled, and reported high-volume livestock production data for corporate supply chains.",
        achievements: [
          "Managed production records for enterprise clients including Jollibee, McDonald's, and San Miguel Corporation.",
          "Conducted statistical audits resolving inventory discrepancies and submitting weekly executive summaries."
        ],
        technologies: ["Data Analytics", "Audit & Reconciliations", "Executive Reporting"],
        display_order: 9
      }
    ];

    for (const exp of experiences) {
      await client.query(`
        INSERT INTO experiences (
          company, role, location, employment_type, start_date, end_date, duration,
          is_current, description, achievements, technologies, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        exp.company, exp.role, exp.location, exp.employment_type, exp.start_date,
        exp.end_date, exp.duration, exp.is_current, exp.description,
        JSON.stringify(exp.achievements), JSON.stringify(exp.technologies), exp.display_order
      ]);
    }

    // 4. Seed Projects
    const projects = [
      {
        title: "Process Center",
        slug: "process-center",
        role: "Lead Developer & Integration Point Person",
        category: "Integration & Cloud",
        overview: "An independent enterprise service built with Laravel acting as a middleware and transaction proxy between external client systems and the internal platform. Transcodes incoming client payloads into legacy platform specifications and centralizes high-volume transactions.",
        scale_architecture: "Handles thousands of orders on a daily basis. Automatically fetches hundreds of images per payload, performing automated enhancements, grouping, cutting, rotation, and print-preparation operations.",
        responsibilities: [
          "Led the end-to-end integration of the company's largest strategic client, taking the service from requirements through production deployment.",
          "Developed user-facing operational control dashboards with ReactJS for real-time order monitoring and error inspection.",
          "Implemented automated image processing pipelines utilizing ImageMagick and Apache PDFBox.",
          "Handled rapid diagnostic escalations and maintained 99.9% uptime during peak retail cycles."
        ],
        technologies: ["Laravel", "ImageMagick", "Apache PDFBox", "Java", "Python", "Rsync", "Docker", "PostgreSQL", "ReactJS"],
        live_url: "https://zensmart.ai",
        github_url: "",
        is_featured: true,
        display_order: 0
      },
      {
        title: "Akamai POS",
        slug: "akamai-pos",
        role: "Full-Stack Developer",
        category: "Enterprise Software",
        overview: "Comprehensive Point of Sale (POS) system engineered for high reliability in retail and dining environments, featuring complete inventory, employee, and reporting workflows.",
        scale_architecture: "Modular MVC architecture with optimized PostgreSQL queries for fast transaction settlement and reliable offline-friendly state.",
        responsibilities: [
          "Resolved complex legacy issues and engineered 4 new core modules from scratch: Authentication, Time Tracking, Dynamic Production Reports, and CRUD Item Management.",
          "Refactored front-end views using Bootstrap 3 and jQuery to provide snappy touchscreen usability.",
          "Implemented comprehensive auditing and daily financial reconciliation reports."
        ],
        technologies: ["CodeIgniter 3", "PostgreSQL", "jQuery", "Bootstrap 3", "PHP"],
        live_url: "",
        github_url: "",
        is_featured: true,
        display_order: 1
      },
      {
        title: "Crate Club Subscription",
        slug: "crate-club",
        role: "Core Full-Stack Developer",
        category: "E-Commerce & Subscriptions",
        overview: "High-volume e-commerce subscription commerce platform delivering curated tactical gear packages directly to subscribers nationwide.",
        scale_architecture: "Integrated with Stripe subscriptions, automated billing retries, multi-carrier shipping webhooks, and automated warehouse packing slip generators.",
        responsibilities: [
          "Co-architected the entire platform from inception through to commercial release.",
          "Engineered recurring billing, refund handling, invoicing, and transactional email triggers.",
          "Developed mobile-ready REST API endpoints consumed by native iOS and Android applications.",
          "Built real-time revenue analytics dashboards for leadership."
        ],
        technologies: ["Laravel", "Laraship", "ReactJS", "Tailwind CSS", "MySQL", "Stripe API"],
        live_url: "https://crateclub.com",
        github_url: "",
        is_featured: true,
        display_order: 2
      },
      {
        title: "Midtown Website",
        slug: "midtown-portal",
        role: "Lead Designer & Theme Developer",
        category: "Web Development",
        overview: "Official corporate marketing and commercial customer generation portal for Mindanao's premier commercial printing house.",
        scale_architecture: "Custom WordPress theme framework engineered for sub-second load times and high organic SEO conversion.",
        responsibilities: [
          "Designed and coded responsive WordPress themes and templates from scratch without heavy builder dependencies.",
          "Maintained ongoing security hardening, automated backup pipelines, and core updates.",
          "Delivered three full redesign iterations commemorating corporate milestones."
        ],
        technologies: ["WordPress", "Bootstrap", "MySQL", "HTML5", "CSS3", "PHP"],
        live_url: "https://midtown.com.ph",
        github_url: "",
        is_featured: false,
        display_order: 3
      },
      {
        title: "Student Online Services (SOS)",
        slug: "student-online-services",
        role: "Contributor & Full-Stack Developer",
        category: "Education Portals",
        overview: "Centralized school portal used by Midtown Printing to collect, validate, and organize student biographical data and portraits across partner universities for yearbook publishing.",
        scale_architecture: "Multi-school tenant isolation with automated portrait validation and bulk export for desktop publishing teams.",
        responsibilities: [
          "Upgraded front-end styling architecture from legacy Bootstrap 2 to Bootstrap 3.",
          "Engineered institutional data segregation, automated confirmation emails, and student identity verification.",
          "Authored technical specifications and provided helpdesk escalation support."
        ],
        technologies: ["CodeIgniter 3", "MySQL", "Bootstrap 2 / 3", "PHP", "jQuery"],
        live_url: "https://sos.midtown.com.ph",
        github_url: "",
        is_featured: false,
        display_order: 4
      },
      {
        title: "Revenue Memorandum Circulars",
        slug: "rmc-system",
        role: "Core Full-Stack Developer",
        category: "Regulatory & Compliance",
        overview: "Automated regulatory and fiscal document tracking system for processing, searching, and categorizing internal tax memorandum circulars and public issuances.",
        scale_architecture: "Full-text indexing with asynchronous CSV bulk parser and metadata relationship mapper.",
        responsibilities: [
          "Built the application end-to-end from specification to deployment.",
          "Engineered bulk CSV ingestion that parses and automatically segregates related documents by fiscal year and authority.",
          "Implemented role-based access control, document annotation, and audit reporting."
        ],
        technologies: ["CodeIgniter 3", "MySQL", "Bootstrap 3", "PHP"],
        live_url: "",
        github_url: "",
        is_featured: false,
        display_order: 5
      }
    ];

    for (const prj of projects) {
      await client.query(`
        INSERT INTO projects (
          title, slug, role, category, overview, scale_architecture,
          responsibilities, technologies, live_url, github_url, is_featured, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        prj.title, prj.slug, prj.role, prj.category, prj.overview, prj.scale_architecture,
        JSON.stringify(prj.responsibilities), JSON.stringify(prj.technologies),
        prj.live_url, prj.github_url, prj.is_featured, prj.display_order
      ]);
    }

    // 5. Seed Education
    await client.query(`
      INSERT INTO education (
        institution, degree, field_of_study, location, campus_address,
        dates, thesis, leadership, core_focus, description, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      "Caraga State University",
      "Bachelor of Science in Computer Science",
      "Computer Science",
      "Butuan City, Philippines",
      "National Road, Barangay Ampayon, Butuan City, Philippines",
      "June 2006 – March 29, 2012",
      "A Ten (10) Peso Attribute Classifier for Coin Detection (Machine Learning / Computer Vision)",
      JSON.stringify([
        "Project Director – Junior Philippine Computer Society (JPCS)",
        "Vice President – Computer Science Society (CSS)"
      ]),
      "Programming and Software Development, Algorithms and Data Structures, Computer Organization and Architecture, Operating Systems, Computer Networks, Databases, Artificial Intelligence, and Machine Learning.",
      "Developed a solid theoretical and practical engineering foundation through comprehensive coursework, academic projects, and practical computing applications.",
      0
    ]);

    // 6. Seed Certifications
    const certs = [
      { title: "Principle of Design for Developers", issuer: "Online Certification", display_order: 0 },
      { title: "Project Management for Freelance Developers", issuer: "Professional Development", display_order: 1 },
      { title: "Laravel 5", issuer: "Framework Specialization", display_order: 2 },
      { title: "Elm: A Beginners' Guide to Elm and Data", issuer: "Functional Programming", display_order: 3 },
      { title: "Animating with CSS", issuer: "Frontend UI/UX", display_order: 4 }
    ];

    for (const c of certs) {
      await client.query(`
        INSERT INTO certifications (title, issuer, display_order)
        VALUES ($1, $2, $3)
      `, [c.title, c.issuer, c.display_order]);
    }

    // 7. Seed References
    const refs = [
      {
        name: "Samuel Brent",
        role: "Director and CID",
        company: "Picture Works Group Ltd",
        email: "samuel.brent@pictureworks.com.au",
        phone: "",
        profile_url: "",
        relationship: "Director & Technical Executive",
        quote: "Fil served as our primary integration lead orchestrating the API integration of our largest strategic client into our proprietary system. Exceptional problem solver and reliable technical leader.",
        display_order: 0
      },
      {
        name: "Ms. Xysa Rhea Bitonga",
        role: "Project Manager and QA",
        company: "Crate Club Group Inc",
        email: "",
        phone: "",
        profile_url: "https://www.facebook.com/msxysarhea",
        relationship: "Project Manager & QA Lead",
        quote: "Fil's ability to drive full-stack development, architect critical backend payment and logistics modules, and coordinate with cross-functional teams made him an invaluable asset to our launch.",
        display_order: 1
      }
    ];

    for (const r of refs) {
      await client.query(`
        INSERT INTO "references" (name, role, company, email, phone, profile_url, relationship, quote, display_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [r.name, r.role, r.company, r.email, r.phone, r.profile_url, r.relationship, r.quote, r.display_order]);
    }

    // 8. Seed Publications
    await client.query(`
      INSERT INTO publications (title, description, display_order)
      VALUES ($1, $2, $3)
    `, [
      "A 10 Peso Attribute Classifier For Coin Detection",
      "Academic research publication applying computer vision and supervised classification techniques to automated currency denomination identification.",
      0
    ]);

    await client.query('COMMIT');
    console.log('Database seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seeding process finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seed;
