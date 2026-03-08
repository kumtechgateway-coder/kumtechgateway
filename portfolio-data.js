/**
 * Portfolio Data Source
 * Single source of truth for all project content.
 */
const portfolioData = [
    {
        id: "kumtech-branding",
        category: "Branding",
        title: "Kumtech Gateway Identity",
        description: "Complete brand identity design including logo, color palette, and visual assets for a leading tech agency.",
        image: "images/kumtechlogo.webp",
        fullData: {
            client: "Kumtech Gateway",
            timeline: "2024",
            services: "Logo Design, Brand Strategy, UI/UX",
            challenge: "To create a modern, tech-focused identity that reflects reliability and innovation.",
            solution: "We developed a clean, geometric logo and a vibrant color palette combining Tech Blue and Cyan.",
            results: ["Increased brand recognition", "Consistent visual language", "Modernized digital presence"],
            gallery: [
                "images/kumtechcolor.webp",
                "images/kumtechmockup.webp", 
                "images/kumtechmodel.webp",
            ]
        }
    },
    {
        id: "modern-ecom",
        category: "Web Design",
        title: "Modern E-commerce Platform",
        description: "Sleek and user-friendly e-commerce website with advanced shopping features and mobile-first design.",
        image: "https://placehold.co/800x600/e2e8f0/1F3C88?text=Modern+E-commerce",
        fullData: {
            client: "Global Retail Co.",
            timeline: "2024",
            services: "Web Design, Development, UX Research",
            challenge: "Client needed a fast, responsive, and visually appealing e-commerce site to increase online sales and improve user engagement.",
            solution: "We designed and developed a custom Shopify theme with a focus on a mobile-first experience, a streamlined checkout process, and high-quality product visuals.",
            results: ["30% increase in conversion rate", "50% faster page load times", "Enhanced mobile shopping experience"],
            gallery: [
                "https://placehold.co/800x600/e2e8f0/1F3C88?text=Product+Page",
                "https://placehold.co/800x600/e2e8f0/1F3C88?text=Checkout+Flow"
            ],
            liveUrl: "https://kumtechgateway.com/"
        }
    },
    {
        id: "social-media-boost",
        category: "Marketing",
        title: "Social Media Campaign Boost",
        description: "Increased engagement and followers with targeted social media marketing strategies on Instagram and TikTok.",
        image: "https://placehold.co/800x600/F97316/FFFFFF?text=Social+Media+Boost",
        fullData: {
            client: "Lifestyle Influencer",
            timeline: "2024",
            services: "Ads Management, Content Creation, Analytics",
            challenge: "To grow the client's audience on Instagram and TikTok and increase engagement on their posts.",
            solution: "We ran targeted ad campaigns, created a content calendar with viral-potential videos, and engaged with the community to build a loyal following.",
            results: ["Follower count grew by 150% in 3 months", "Engagement rate doubled", "Secured two major brand partnerships"],
            gallery: [
                "https://placehold.co/800x600/F97316/FFFFFF?text=Instagram+Story",
                "https://placehold.co/800x600/F97316/FFFFFF?text=Analytics+Dashboard"
            ]
        }
    },
    {
        id: "intuitive-app-design",
        category: "UI/UX",
        title: "Intuitive Mobile App Design",
        description: "Enhanced user experience with an intuitive and engaging mobile app interface for a health tech startup.",
        image: "https://placehold.co/800x600/0F172A/FFFFFF?text=App+Interface",
        fullData: {
            client: "HealthTech Startup",
            timeline: "2023",
            services: "UI/UX Design, Prototyping, User Testing",
            challenge: "The startup had a complex health tracking app that users found confusing and difficult to navigate.",
            solution: "We conducted user research to identify pain points and redesigned the entire user flow. We created a clean, intuitive interface with a clear information hierarchy and interactive prototypes for testing.",
            results: ["User satisfaction score increased by 40%", "Task completion time reduced by 60%", "Positive reviews in the app store surged"],
            gallery: [
                "https://placehold.co/800x600/0F172A/FFFFFF?text=Mobile+App+Screens",
                "https://placehold.co/800x600/0F172A/FFFFFF?text=User+Flow+Diagram"
            ]
        },
    },
    {
        id: "scalable-api-solution",
        category: "Development",
        title: "Scalable API Solution",
        description: "Robust and scalable API development for seamless data integration across platforms using Node.js.",
        image: "https://placehold.co/800x600/1F3C88/FFFFFF?text=API+Solution",
        fullData: {
            client: "SaaS Provider",
            timeline: "2023",
            services: "Backend Development, API Design, DevOps",
            challenge: "The client's existing API was struggling to handle increasing traffic, leading to performance bottlenecks and downtime.",
            solution: "We architected and built a new microservices-based API using Node.js and deployed it on a scalable cloud infrastructure. This ensured high availability and low latency.",
            results: ["99.99% uptime achieved", "API response time reduced by 80%", "Enabled seamless integration for new partners"],
            gallery: [
                "https://placehold.co/800x600/1F3C88/FFFFFF?text=System+Architecture",
                "https://placehold.co/800x600/1F3C88/FFFFFF?text=API+Documentation"
            ]
        }
    },
    {
        id: "eco-friendly-brand",
        category: "Branding",
        title: "Eco-Friendly Brand Identity",
        description: "Developed a brand focused on sustainability with eco-friendly materials and messaging.",
        image: "https://placehold.co/800x600/22C55E/FFFFFF?text=Eco+Branding",
        fullData: {
            client: "Sustainable Goods Co.",
            timeline: "2024",
            services: "Branding, Packaging Design, Content Strategy",
            challenge: "Create a brand identity that communicates the company's commitment to sustainability without appearing generic or preachy.",
            solution: "We developed a nature-inspired color palette, custom typography, and packaging made from recycled materials. The brand voice was crafted to be authentic and inspiring.",
            results: ["Strong brand differentiation in a crowded market", "Positive media coverage in sustainability blogs", "25% increase in customer loyalty"],
            gallery: [
                "https://placehold.co/800x600/22C55E/FFFFFF?text=Eco+Packaging",
                "https://placehold.co/800x600/22C55E/FFFFFF?text=Sustainable+Logo"
            ]
        }
    },
    {
        id: "portfolio-website",
        category: "Web Design",
        title: "High-Performance Portfolio",
        description: "Optimized portfolio website with fast loading times and a smooth user experience for a creative photographer.",
        image: "https://placehold.co/800x600/333333/FFFFFF?text=Portfolio+Design",
        fullData: {
            client: "Creative Photographer",
            timeline: "2023",
            services: "Web Design, Web Development, SEO",
            challenge: "The client needed a visually stunning portfolio that loaded quickly and ranked well on search engines to attract new clients.",
            solution: "We built a custom, static-generated website with optimized images and a clean, minimalist design to showcase the photography. Implemented on-page and technical SEO best practices.",
            results: ["Achieved a 98/100 Google PageSpeed score", "Ranked on the first page for target keywords", "Online inquiries increased by 40%"],
            gallery: [
                "https://placehold.co/800x600/333333/FFFFFF?text=Portfolio+Grid",
                "https://placehold.co/800x600/333333/FFFFFF?text=Project+Detail"
            ]
        }
    },
    {
        id: "seo-strategy",
        category: "Marketing",
        title: "Comprehensive SEO Strategy",
        description: "Data-driven SEO campaign that improved search rankings and organic traffic for a local law firm.",
        image: "https://placehold.co/800x600/FDBA74/1F3C88?text=SEO+Campaign",
        fullData: {
            client: "Local Law Firm",
            timeline: "2024",
            services: "SEO, Content Marketing, Local SEO",
            challenge: "The law firm was struggling to attract local clients online and was being outranked by larger competitors.",
            solution: "We conducted a thorough SEO audit, optimized their Google Business Profile, and created a content strategy focused on local legal topics. We also built high-quality local citations.",
            results: ["Top 3 ranking in local search results for key practice areas", "50% increase in organic website traffic", "A significant rise in qualified leads from the website"],
            gallery: [
                "https://placehold.co/800x600/FDBA74/1F3C88?text=Keyword+Ranking",
                "https://placehold.co/800x600/FDBA74/1F3C88?text=Traffic+Growth"
            ]
        }
    },
    {
        id: "real-estate-portal",
        category: "Web Design",
        title: "Real Estate Portal",
        description: "Feature-rich property listing platform with advanced search and map integration.",
        image: "https://placehold.co/800x600/00B4D8/FFFFFF?text=Real+Estate+Portal",
        fullData: {
            client: "Property Group",
            timeline: "2023",
            services: "Web Design, Development, Map Integration",
            challenge: "To build a user-friendly property portal that allows users to easily search for listings with advanced filters and an interactive map view.",
            solution: "We developed a custom web application with a powerful search engine, integrated with Mapbox for a seamless map experience, and designed an intuitive interface for both buyers and agents.",
            results: ["User engagement increased by 70%", "Average time on site tripled", "Became the go-to property portal in the local area"],
            gallery: [
                "https://placehold.co/800x600/00B4D8/FFFFFF?text=Property+Map",
                "https://placehold.co/800x600/00B4D8/FFFFFF?text=Listing+Details"
            ]
        }
    },
    {
        id: "fitness-tracker",
        category: "Development",
        title: "Fitness Tracker App",
        description: "Cross-platform mobile application for tracking workouts and health metrics using React Native.",
        image: "https://placehold.co/800x600/EF4444/FFFFFF?text=Fitness+App",
        fullData: {
            client: "Wellness Tech",
            timeline: "2024",
            services: "Mobile App Development, UI/UX, API Development",
            challenge: "Develop a cross-platform mobile app for tracking workouts, setting goals, and connecting with a community, ensuring a smooth and motivating user experience.",
            solution: "We used React Native to build the app for both iOS and Android from a single codebase. The app features real-time tracking, social sharing, and a custom-built backend for data synchronization.",
            results: ["Launched on both app stores within 6 months", "Featured as 'New App We Love' on the App Store", "Over 50,000 downloads in the first quarter"],
            gallery: [
                "https://placehold.co/800x600/EF4444/FFFFFF?text=Workout+Stats",
                "https://placehold.co/800x600/EF4444/FFFFFF?text=Activity+Graph"
            ]
        }
    },
    {
        id: "email-marketing",
        category: "Marketing",
        title: "Email Marketing Automation",
        description: "Automated email workflows that increased customer retention and sales for an online retailer.",
        image: "https://placehold.co/800x600/F97316/FFFFFF?text=Email+Marketing",
        fullData: {
            client: "Online Retailer",
            timeline: "2023",
            services: "Email Marketing, Automation, Content Strategy",
            challenge: "The client wanted to increase customer lifetime value and recover abandoned carts through effective email marketing.",
            solution: "We set up automated email workflows for welcome series, abandoned carts, and post-purchase follow-ups. We also designed new email templates and segmented the audience for targeted campaigns.",
            results: ["25% recovery rate for abandoned carts", "Email-driven revenue increased by 40%", "Open rates improved by 15%"],
            gallery: [
                "https://placehold.co/800x600/F97316/FFFFFF?text=Newsletter+Template",
                "https://placehold.co/800x600/F97316/FFFFFF?text=Campaign+Results"
            ]
        }
    },
    {
        id: "travel-branding",
        category: "Branding",
        title: "Travel Agency Branding",
        description: "Vibrant and adventurous brand identity for a modern travel agency targeting thrill-seekers.",
        image: "https://placehold.co/800x600/00B4D8/FFFFFF?text=Travel+Branding",
        fullData: {
            client: "Adventure Tours Co.",
            timeline: "2024",
            services: "Branding, Logo Design, Web Design",
            challenge: "To create a brand identity that captures the spirit of adventure and appeals to a younger, thrill-seeking demographic.",
            solution: "We designed a dynamic logo, a bold color palette, and a website filled with immersive photography and video. The brand messaging focuses on unique experiences and storytelling.",
            results: ["Successfully repositioned the brand to the target demographic", "Social media engagement increased by 200%", "Bookings for adventure packages went up by 60%"],
            gallery: [
                "https://placehold.co/800x600/00B4D8/FFFFFF?text=Travel+Brochure",
                "https://placehold.co/800x600/00B4D8/FFFFFF?text=Adventure+Logo"
            ]
        }
    }
];