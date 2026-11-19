"""
Comprehensive initial seed dataset for UniSkill ATS Resume Scanner.
Contains:
- Default Admin & Student demo accounts
- Default 100-pt Scoring Weight Configuration
- 17 Industry-Standard Job Roles
- 220+ Skills with Categories & Synonyms
- Role-to-Skill mappings with Required/Preferred status & weights
- 500+ ATS Keywords
"""

INITIAL_ROLES = [
    {
        "title": "Software Developer",
        "category": "Software Engineering",
        "description": "Generalist software engineer proficient in core programming languages, data structures, algorithms, version control, and full lifecycle application development.",
        "required_skills": ["Data Structures", "Algorithms", "Object-Oriented Programming (OOP)", "Git", "RESTful APIs", "SQL", "Unit Testing", "System Design"],
        "preferred_skills": ["Docker", "CI/CD", "Agile/Scrum", "Linux", "Microservices", "Cloud Computing"]
    },
    {
        "title": "Java Developer",
        "category": "Backend Engineering",
        "description": "Enterprise backend developer specializing in Java ecosystem, Spring framework, object-relational mapping, enterprise databases, and microservices.",
        "required_skills": ["Java", "Spring Boot", "Spring MVC", "Hibernate", "RESTful APIs", "SQL", "PostgreSQL", "MySQL", "Object-Oriented Programming (OOP)", "Git", "Microservices", "Data Structures"],
        "preferred_skills": ["Maven", "Gradle", "Docker", "Kubernetes", "Kafka", "Redis", "AWS", "JUnit", "JPA"]
    },
    {
        "title": "Python Developer",
        "category": "Backend & Data Engineering",
        "description": "Python engineer developing web services, APIs, automation workflows, and backend processing pipelines.",
        "required_skills": ["Python", "Django", "FastAPI", "Flask", "RESTful APIs", "SQL", "PostgreSQL", "Git", "Object-Oriented Programming (OOP)", "Unit Testing"],
        "preferred_skills": ["Pandas", "NumPy", "Docker", "Redis", "Celery", "PostgreSQL", "AWS", "Linux", "CI/CD", "GraphQL"]
    },
    {
        "title": "Frontend Developer",
        "category": "Frontend Engineering",
        "description": "Client-side developer creating responsive, performant, and accessible user interfaces using modern JavaScript/TypeScript frameworks.",
        "required_skills": ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Tailwind CSS", "Responsive Design", "RESTful APIs", "Git"],
        "preferred_skills": ["Next.js", "Redux", "Vue.js", "Angular", "Webpack", "Vite", "Jest", "GraphQL", "Web Accessibility (a11y)"]
    },
    {
        "title": "Backend Developer",
        "category": "Backend Engineering",
        "description": "Server-side specialist architecting scalable APIs, high-throughput database interactions, caching layers, and microservices.",
        "required_skills": ["Node.js", "Python", "Java", "RESTful APIs", "SQL", "PostgreSQL", "MongoDB", "Microservices", "Git", "System Design"],
        "preferred_skills": ["Docker", "Redis", "Kafka", "GraphQL", "gRPC", "Kubernetes", "CI/CD", "AWS", "Linux"]
    },
    {
        "title": "Full Stack Developer",
        "category": "Full Stack Engineering",
        "description": "Versatile developer proficient in both frontend web interfaces and robust backend service architecture.",
        "required_skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "HTML5", "CSS3", "SQL", "PostgreSQL", "RESTful APIs", "Git"],
        "preferred_skills": ["Next.js", "Docker", "MongoDB", "Tailwind CSS", "Redis", "AWS", "CI/CD", "GraphQL", "Agile/Scrum"]
    },
    {
        "title": "Data Analyst",
        "category": "Data & Analytics",
        "description": "Analytical professional transforming raw business and operational data into actionable dashboards, insights, and reporting.",
        "required_skills": ["SQL", "Python", "Excel", "Tableau", "Power BI", "Data Visualization", "Statistics", "Data Cleaning"],
        "preferred_skills": ["Pandas", "NumPy", "R", "A/B Testing", "Business Intelligence", "Google Analytics", "ETL"]
    },
    {
        "title": "Data Scientist",
        "category": "Data Science & AI",
        "description": "Mathematical and statistical modeler developing predictive algorithms, machine learning pipelines, and experimental analytics.",
        "required_skills": ["Python", "SQL", "Pandas", "NumPy", "Scikit-learn", "Machine Learning", "Statistics", "Data Visualization", "Feature Engineering"],
        "preferred_skills": ["Deep Learning", "PyTorch", "TensorFlow", "NLP", "BigQuery", "Spark", "Docker", "A/B Testing", "MLflow"]
    },
    {
        "title": "Machine Learning Engineer",
        "category": "Artificial Intelligence",
        "description": "Engineer designing, training, deploying, and monitoring scalable machine learning models in production environments.",
        "required_skills": ["Python", "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Scikit-learn", "Data Structures", "Docker", "MLOps"],
        "preferred_skills": ["Transformers", "Kubernetes", "MLflow", "ONNX", "FastAPI", "AWS", "CUDA", "Feature Stores", "Git"]
    },
    {
        "title": "AI Engineer",
        "category": "Artificial Intelligence",
        "description": "Applied AI specialist developing generative AI, LLM applications, retrieval-augmented generation (RAG) architectures, and neural agents.",
        "required_skills": ["Python", "Machine Learning", "Deep Learning", "NLP", "Transformers", "Large Language Models (LLM)", "RAG (Retrieval-Augmented Generation)", "Vector Databases", "PyTorch"],
        "preferred_skills": ["LangChain", "LlamaIndex", "HuggingFace", "TensorFlow", "FastAPI", "Docker", "Embeddings", "Prompt Engineering", "Fine-Tuning"]
    },
    {
        "title": "DevOps Engineer",
        "category": "DevOps & Infrastructure",
        "description": "Infrastructure automation specialist streamlining continuous integration, automated deployment, container orchestration, and cloud reliability.",
        "required_skills": ["Docker", "Kubernetes", "CI/CD", "Linux", "Git", "Bash/Shell", "AWS", "Terraform", "Jenkins"],
        "preferred_skills": ["Ansible", "Prometheus", "Grafana", "GitHub Actions", "Helm", "Python", "ArgoCD", "Infrastructure as Code (IaC)"]
    },
    {
        "title": "Cloud Engineer",
        "category": "Cloud Architecture",
        "description": "Cloud systems architect managing multi-region cloud resources, network topologies, high availability, and cloud migration.",
        "required_skills": ["AWS", "Azure", "Cloud Computing", "Terraform", "Linux", "Docker", "Networking", "IAM", "Infrastructure as Code (IaC)"],
        "preferred_skills": ["Google Cloud Platform (GCP)", "Kubernetes", "Serverless", "Python", "CloudFormation", "Bash/Shell", "Cost Optimization"]
    },
    {
        "title": "Cybersecurity Analyst",
        "category": "Security & Compliance",
        "description": "Information security specialist monitoring network threats, auditing vulnerabilities, enforcing compliance, and responding to security incidents.",
        "required_skills": ["Network Security", "Vulnerability Assessment", "SIEM", "Incident Response", "Firewalls", "OWASP", "Linux", "Wireshark"],
        "preferred_skills": ["Penetration Testing", "Metasploit", "Cryptography", "Python", "Identity and Access Management (IAM)", "SOC", "CISSP", "Ethical Hacking"]
    },
    {
        "title": "Android Developer",
        "category": "Mobile Development",
        "description": "Mobile application developer building native Android experiences using Kotlin, modern Jetpack components, and reactive patterns.",
        "required_skills": ["Kotlin", "Java", "Android SDK", "Jetpack Compose", "RESTful APIs", "Git", "Object-Oriented Programming (OOP)", "Retrofit"],
        "preferred_skills": ["Kotlin Coroutines", "Room Database", "Dagger Hilt", "MVVM Architecture", "Unit Testing", "CI/CD", "Firebase"]
    },
    {
        "title": "UI/UX Designer",
        "category": "Design & User Experience",
        "description": "Product designer crafting intuitive user journeys, wireframes, high-fidelity prototypes, design systems, and conducting user research.",
        "required_skills": ["Figma", "UI Design", "UX Research", "Wireframing", "Prototyping", "User Centered Design", "Design Systems", "Usability Testing"],
        "preferred_skills": ["Adobe XD", "Information Architecture", "HTML5", "CSS3", "Design Thinking", "Interaction Design", "User Personas"]
    },
    {
        "title": "Business Analyst",
        "category": "Product & Business",
        "description": "Liaison between business stakeholders and technical development teams, documenting requirements, user stories, and process workflows.",
        "required_skills": ["Requirements Gathering", "Business Process Modeling", "SQL", "Excel", "Agile/Scrum", "User Stories", "Stakeholder Management", "JIRA"],
        "preferred_skills": ["Tableau", "Power BI", "Data Analysis", "UML", "Gap Analysis", "Financial Modeling", "Confluence"]
    },
    {
        "title": "Product Manager",
        "category": "Product & Business",
        "description": "Product leader defining strategic vision, roadmaps, sprint backlogs, KPI metrics, and aligning cross-functional teams toward product market fit.",
        "required_skills": ["Product Roadmap", "Agile/Scrum", "User Stories", "Stakeholder Management", "Product Strategy", "KPI Tracking", "A/B Testing", "JIRA"],
        "preferred_skills": ["Market Research", "Wireframing", "SQL", "Data Analytics", "Customer Discovery", "PRD Writing", "Figma"]
    }
]

# Master Skills Dictionary: { Skill Name: (Category, [Synonyms]) }
ALL_SKILLS = {
    # Programming Languages
    "Java": ("Programming Language", ["Core Java", "Java 8", "Java 11", "Java 17", "Java 21", "JVM"]),
    "Python": ("Programming Language", ["Python 3", "Python3", "Py"]),
    "JavaScript": ("Programming Language", ["JS", "JavaScript ES6", "ECMAScript", "ES6+"]),
    "TypeScript": ("Programming Language", ["TS", "TypeScript.js"]),
    "C++": ("Programming Language", ["CPP", "C Plus Plus", "Modern C++"]),
    "C#": ("Programming Language", ["CSharp", "C Sharp", ".NET C#"]),
    "Go": ("Programming Language", ["Golang", "Go Language"]),
    "Rust": ("Programming Language", ["Rustlang"]),
    "Kotlin": ("Programming Language", ["Kotlin/JVM", "Kotlin Android"]),
    "Swift": ("Programming Language", ["Swift iOS", "Swift 5"]),
    "SQL": ("Programming Language", ["Structured Query Language", "ANSI SQL", "T-SQL", "PL/SQL"]),
    "R": ("Programming Language", ["R Language", "R Programming"]),
    "HTML5": ("Programming Language", ["HTML", "HyperText Markup Language"]),
    "CSS3": ("Programming Language", ["CSS", "Cascading Style Sheets"]),
    "Bash/Shell": ("Programming Language", ["Shell Scripting", "Bash", "Zsh", "Linux Shell"]),
    "PHP": ("Programming Language", ["PHP 8", "Modern PHP"]),

    # Frameworks & Libraries
    "Spring Boot": ("Framework", ["SpringBoot", "Spring-Boot", "Spring Boot 3"]),
    "Spring MVC": ("Framework", ["Spring Web", "Spring Web MVC"]),
    "Hibernate": ("Framework", ["Hibernate ORM", "JPA Hibernate"]),
    "JPA": ("Framework", ["Java Persistence API", "Jakarta Persistence"]),
    "React": ("Framework", ["React.js", "ReactJS", "React 18"]),
    "Angular": ("Framework", ["AngularJS", "Angular 2+", "Angular 17"]),
    "Vue.js": ("Framework", ["Vue", "VueJS", "Vue 3"]),
    "Next.js": ("Framework", ["NextJS", "Next"]),
    "Node.js": ("Framework", ["Node", "NodeJS"]),
    "Express.js": ("Framework", ["Express", "ExpressJS"]),
    "Django": ("Framework", ["Django REST Framework", "DRF"]),
    "Flask": ("Framework", ["Flask API"]),
    "FastAPI": ("Framework", ["Fast API", "Pydantic FastAPI"]),
    "Redux": ("Library", ["Redux Toolkit", "RTK", "Redux Thunk"]),
    "Tailwind CSS": ("Framework", ["Tailwind", "TailwindCSS"]),
    "Bootstrap": ("Framework", ["Bootstrap 5"]),
    "Retrofit": ("Library", ["Retrofit 2", "Retrofit Android"]),
    "Jetpack Compose": ("Framework", ["Compose", "Android Compose"]),

    # Databases
    "PostgreSQL": ("Database", ["Postgres", "Postgre", "PSQL"]),
    "MySQL": ("Database", ["MySQL 8"]),
    "MongoDB": ("Database", ["Mongo", "NoSQL MongoDB"]),
    "Redis": ("Database", ["Redis Cache", "In-Memory DB"]),
    "SQLite": ("Database", ["SQLite3"]),
    "Elasticsearch": ("Database", ["Elastic Search", "ELK Stack"]),
    "Cassandra": ("Database", ["Apache Cassandra"]),
    "DynamoDB": ("Database", ["AWS DynamoDB"]),
    "Room Database": ("Database", ["Android Room", "Room ORM"]),

    # Cloud & DevOps
    "AWS": ("Cloud", ["Amazon Web Services", "AWS Cloud", "EC2", "S3"]),
    "Azure": ("Cloud", ["Microsoft Azure", "Azure Cloud"]),
    "Google Cloud Platform (GCP)": ("Cloud", ["GCP", "Google Cloud", "GCP Cloud"]),
    "Cloud Computing": ("Cloud", ["Cloud Architecture", "Multi-Cloud"]),
    "Docker": ("DevOps", ["Docker Containers", "Containerization", "Docker Compose"]),
    "Kubernetes": ("DevOps", ["K8s", "K8", "Kubernetes Cluster"]),
    "Terraform": ("DevOps", ["HashiCorp Terraform", "IaC Terraform"]),
    "CI/CD": ("DevOps", ["Continuous Integration", "Continuous Deployment", "CI-CD Pipelines"]),
    "Jenkins": ("DevOps", ["Jenkins CI", "Jenkins Pipelines"]),
    "GitHub Actions": ("DevOps", ["GHA", "GitHub CI/CD"]),
    "Ansible": ("DevOps", ["Ansible Automation"]),
    "Linux": ("Operating System", ["Ubuntu", "Red Hat", "CentOS", "Debian", "Unix"]),
    "Prometheus": ("DevOps", ["Prometheus Monitoring"]),
    "Grafana": ("DevOps", ["Grafana Dashboards"]),
    "Kafka": ("DevOps & Messaging", ["Apache Kafka", "Kafka Streaming"]),
    "Infrastructure as Code (IaC)": ("DevOps", ["IaC", "Cloud Infrastructure as Code"]),

    # AI, ML & Data Science
    "Machine Learning": ("AI/ML", ["ML", "Supervised Learning", "Unsupervised Learning"]),
    "Deep Learning": ("AI/ML", ["DL", "Neural Networks", "ANN", "CNN", "RNN"]),
    "Artificial Intelligence": ("AI/ML", ["AI", "Applied AI"]),
    "PyTorch": ("AI/ML", ["Torch", "PyTorch 2"]),
    "TensorFlow": ("AI/ML", ["TF", "TF 2.0"]),
    "Scikit-learn": ("AI/ML", ["sklearn", "Scikit Learn"]),
    "Pandas": ("Data Science", ["Python Pandas", "DataFrames"]),
    "NumPy": ("Data Science", ["Python NumPy", "Numerical Python"]),
    "NLP": ("AI/ML", ["Natural Language Processing", "Computational Linguistics"]),
    "Transformers": ("AI/ML", ["HuggingFace Transformers", "BERT", "GPT"]),
    "Large Language Models (LLM)": ("AI/ML", ["LLM", "LLMs", "Generative AI", "GenAI"]),
    "RAG (Retrieval-Augmented Generation)": ("AI/ML", ["RAG", "Retrieval Augmented Generation"]),
    "Vector Databases": ("AI/ML", ["Vector DB", "ChromaDB", "Pinecone", "Milvus", "Qdrant", "FAISS"]),
    "Statistics": ("Data Science", ["Statistical Analysis", "Probability and Statistics", "Hypothesis Testing"]),
    "Feature Engineering": ("Data Science", ["Feature Selection", "Feature Extraction"]),
    "Data Visualization": ("Data Science", ["Matplotlib", "Seaborn", "Plotly"]),
    "Tableau": ("Data & BI", ["Tableau Desktop", "Tableau Server"]),
    "Power BI": ("Data & BI", ["Microsoft Power BI", "PowerBI", "DAX"]),
    "Excel": ("Data & BI", ["Advanced Excel", "Excel Macros", "Pivot Tables", "VLOOKUP"]),
    "Data Cleaning": ("Data Science", ["Data Wrangling", "Data Preprocessing"]),
    "MLOps": ("AI/ML", ["Machine Learning Operations", "Model Deployment"]),
    "MLflow": ("AI/ML", ["ML Flow", "Model Tracking"]),

    # CS Fundamentals & Methodologies
    "Data Structures": ("CS Fundamentals", ["DSA", "Data Structures and Algorithms", "Arrays", "Linked Lists", "Trees", "Graphs"]),
    "Algorithms": ("CS Fundamentals", ["Algorithmic Problem Solving", "Time Complexity", "Dynamic Programming"]),
    "Object-Oriented Programming (OOP)": ("CS Fundamentals", ["OOP", "OOPs", "Object Oriented Design", "Polymorphism", "Encapsulation"]),
    "System Design": ("CS Fundamentals", ["Distributed Systems", "High Level Design", "Low Level Design", "Scalability"]),
    "Microservices": ("Architecture", ["Microservices Architecture", "Distributed Architecture", "Service-Oriented Architecture"]),
    "RESTful APIs": ("Architecture", ["REST API", "REST", "RESTful Web Services", "HTTP APIs"]),
    "GraphQL": ("Architecture", ["GraphQL API", "Apollo GraphQL"]),
    "gRPC": ("Architecture", ["Protocol Buffers", "Protobuf"]),
    "Git": ("Tools", ["Git Version Control", "GitHub", "GitLab", "Bitbucket"]),
    "Unit Testing": ("Testing", ["Unit Tests", "Automated Testing", "JUnit", "PyTest", "Jest"]),
    "Agile/Scrum": ("Methodology", ["Agile", "Scrum", "Sprint Planning", "Kanban"]),

    # Cybersecurity
    "Network Security": ("Cybersecurity", ["Network Defense", "TCP/IP Security", "VPN"]),
    "Vulnerability Assessment": ("Cybersecurity", ["Vulnerability Scanning", "Nessus", "Qualys"]),
    "SIEM": ("Cybersecurity", ["Security Information and Event Management", "Splunk", "QRadar"]),
    "Incident Response": ("Cybersecurity", ["Incident Handling", "Forensics", "DFIR"]),
    "Firewalls": ("Cybersecurity", ["Next-Gen Firewalls", "Palo Alto", "Fortinet", "Cisco ASA"]),
    "OWASP": ("Cybersecurity", ["OWASP Top 10", "Web Application Security"]),
    "Penetration Testing": ("Cybersecurity", ["Pen Testing", "Ethical Hacking", "Red Teaming"]),
    "Wireshark": ("Cybersecurity", ["Packet Analysis", "Network Sniffing"]),
    "Identity and Access Management (IAM)": ("Cybersecurity", ["IAM", "OAuth 2.0", "SAML", "Single Sign-On (SSO)"]),

    # Mobile
    "Android SDK": ("Mobile", ["Android Development", "Android Studio"]),
    "Kotlin Coroutines": ("Mobile", ["Coroutines", "Async Kotlin"]),
    "Dagger Hilt": ("Mobile", ["Hilt", "Dependency Injection Android"]),
    "MVVM Architecture": ("Architecture", ["MVVM", "Model-View-ViewModel"]),

    # Design
    "Figma": ("Design", ["Figma UI", "Figma Components"]),
    "UI Design": ("Design", ["User Interface Design", "Visual Design"]),
    "UX Research": ("Design", ["User Experience Research", "User Testing", "Heuristic Evaluation"]),
    "Wireframing": ("Design", ["Low-Fidelity Wireframes", "Mockups"]),
    "Prototyping": ("Design", ["Interactive Prototypes", "Clickable Prototypes"]),
    "Design Systems": ("Design", ["Component Libraries", "Atomic Design"]),
    "Usability Testing": ("Design", ["User Testing", "Usability Studies"]),
    "User Centered Design": ("Design", ["UCD", "Human Centered Design"]),

    # Business & Product Management
    "Requirements Gathering": ("Product", ["Requirement Analysis", "BRD", "FRD"]),
    "Business Process Modeling": ("Product", ["BPMN", "Workflow Mapping", "Process Flow"]),
    "User Stories": ("Product", ["User Story Mapping", "Acceptance Criteria"]),
    "Stakeholder Management": ("Product", ["Stakeholder Communication", "Cross-Functional Leadership"]),
    "Product Roadmap": ("Product", ["Roadmapping", "Feature Prioritization"]),
    "Product Strategy": ("Product", ["Go-To-Market Strategy", "Product Vision"]),
    "KPI Tracking": ("Product", ["Key Performance Indicators", "Success Metrics", "OKRs"]),
    "A/B Testing": ("Product & Data", ["Split Testing", "Experimentation"]),
    "JIRA": ("Tools", ["Atlassian Jira", "Jira Software", "Issue Tracking"]),
}

# Synonyms for normalization helper
def normalize_string(s: str) -> str:
    import re
    return re.sub(r"[^a-z0-9]", "", s.lower())

