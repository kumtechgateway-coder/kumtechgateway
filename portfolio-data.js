/**
 * Portfolio Data Source
 * Single source of truth for all project content.
 */
const portfolioData = [

    /*kumtechgateway*/
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
            ],
            technologies: ["Figma", "Illustrator", "Photoshop"]
        }
    },

    /*rmdigitalvillage*/
    {
        id: "rm-digital-village",
        category: "Branding & Identity",
        title: "RM Digital Village Visual Identity",
        description: "A comprehensive brand identity system for a digital-first organization, featuring a tech-forward color palette and professional stationery mockups.",
        image: "images/rmlogo.webp",
        fullData: {
            client: "RM Digital Village",
            timeline: "2024",
            services: "Brand Strategy, Logo Design, Visual Identity, Brand Guidelines",
            challenge: "The client needed a modern, cohesive brand identity that communicated reliability and technological innovation ('Your Digital Paddy') across both digital and physical touchpoints.",
            solution: "We developed a 'Universal Digital Brand' palette using high-contrast tech blues (#1F3C88) and vibrant oranges (#F97316). The logo combines sharp typography with a dynamic 'RM' monogram, supported by a full suite of brand assets including corporate stationery, apparel, and digital guidelines.",
            results: [
                "Unified brand presence across digital and print media",
                "Established a professional 'Tech-Blue' visual language",
                "Delivered comprehensive brand guidelines for scalable growth"
            ],
            gallery: [
                "images/rmcolor.webp",
                "images/rmmockup.webp",
                "images/rmmodel.webp"
            ],
            technologies: ["Adobe Illustrator", "Adobe Photoshop", "Figma"],
            liveUrl: "https://kumtechgateway.com/"
        }
    },

    /*goldenaura*/ 
    {
        id: "golden-aura",
        category: "Branding & Identity",
        title: "Golden Aura Luxury Branding",
        description: "A sophisticated and elegant brand identity designed for a high-end wellness or lifestyle brand, utilizing a warm, premium palette.",
        image: "images/goldenlogo.webp",
        fullData: {
            client: "Golden Aura",
            timeline: "2024",
            services: "Visual Identity, Premium Packaging Design, Brand Typography",
            challenge: "The brand required a visual language that felt both luxurious and personal, targeting a demographic that values wellness and exclusivity.",
            solution: "We curated a 'Brand Color Palette' featuring Gold (#E2BE6C) and Aura Pink (#F4909E) against a Deep Black (#0A0A0A) background. The logo features a delicate, floral-inspired emblem that communicates growth and serenity.",
            results: [
                "Achieved a premium, high-end market positioning",
                "Seamless brand application from digital apps to physical luxury packaging",
                "Strong emotional resonance through warm, inviting color theory"
            ],
            gallery: [
                "images/goldencolor.webp",
                "images/goldenmockup.webp",
                "images/goldenmodel.webp"
            ],
            technologies: ["Adobe Illustrator", "Adobe Photoshop", "InDesign"],
            liveUrl: "https://kumtechgateway.com/"
        }
    },

    /* rapha maria */
    {
        id: "rapha-maria-residence",
        category: "Branding & Identity",
        title: "Rapha Maria Residence Visual Identity",
        description: "An elegant and welcoming brand identity for a premium residential property, featuring a soft pastel palette.",
        image: "images/raphalogo.webp",
        fullData: {
            client: "Rapha Maria Residence",
            timeline: "2024",
            services: "Identity Design, Real Estate Branding, Merchandising",
            challenge: "The client needed an identity that balanced professional real estate reliability with a warm, 'home-like' feel.",
            solution: "We developed an 'Elegant Pastel Color Palette' using Navy Blue (#1E2A44) for authority, softened by Blush Pink (#E7C9D0) and Ivory (#FFFFF4). The house icon integrates these tones to symbolize safety and comfort.",
            results: [
                "Created a unique visual niche in the real estate market",
                "Developed a versatile logo that scales perfectly from business cards to signage",
                "Established a cohesive brand feel for both staff apparel and digital presence"
            ],
            gallery: [
                "images/raphacolor.webp",
                "images/raphamodel.webp"
            ],
            technologies: ["Adobe Illustrator", "Figma", "Photoshop"],
            liveUrl: "https://kumtechgateway.com/"
        }
    },

    /*faithconstruction */
    {
        id: "faith-construction",
        category: "Web Development",
        title: "Faith Construction Corporate Site",
        description: "A high-performance, dynamic corporate website for Cameroon’s premier builder, featuring a modern dark-mode aesthetic and real-time project statistics.",
        image: "images/faithconstruction.webp",
        fullData: {
            client: "Faith Construction",
            timeline: "2024",
            services: "Web Design, Frontend Development, UI/UX Optimization",
            challenge: "The client required a professional digital presence to showcase their 200+ completed projects and 15+ years of experience while facilitating direct client consultations.",
            solution: "We built a responsive, dynamic landing page using a dark-theme UI to emphasize luxury and stability. The site features a 'Request a Quote' lead generation system, integrated WhatsApp support, and a data-driven statistics counter section.",
            results: [
                "100% responsive design across all mobile and desktop devices",
                "Streamlined lead generation via integrated consultation triggers",
                "Optimized performance using Tailwind CSS for rapid load times"
            ],
            gallery: [
                "images/faithconstruction.webp"
            ],
            technologies: ["HTML5", "TailwindCSS", "JavaScript", "JSON"],
            liveUrl: "https://kumtechgateway.com/"
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
            ],
            technologies: ["Illustrator", "Figma", "Shopify"]
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
            ],
            technologies: ["HTML5", "CSS3", "JavaScript", "Eleventy", "Netlify"]
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
            ],
            technologies: ["Ahrefs", "SEMrush", "Google Analytics", "Google Search Console"]
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
            ],
            technologies: ["React", "Node.js", "Mapbox", "PostgreSQL"]
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
            ],
            technologies: ["React Native", "Firebase", "Node.js"]
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
            ],
            technologies: ["Mailchimp", "Klaviyo", "HTML Email"]
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
            ],
            technologies: ["Figma", "Webflow", "Illustrator"]
        }
    }
];