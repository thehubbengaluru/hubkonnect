export const SKILLS_DATA: Record<string, string[]> = {
  Design: ["UI/UX Design", "Graphic Design", "Illustration", "3D Design", "Motion Graphics", "Figma", "Adobe Suite"],
  Development: ["Frontend", "Backend", "Full-Stack", "Mobile Dev", "AI/ML", "React", "Node.js", "Python"],
  Content: ["Writing", "Video Editing", "Photography", "Podcasting", "Social Media", "Copywriting"],
  Marketing: ["Digital Marketing", "SEO", "Brand Strategy", "Performance Marketing", "Content Marketing", "Email Marketing"],
  Business: ["Product Management", "Sales", "Operations", "Finance", "HR", "Strategy", "Analytics"],
  Creative: ["Music Production", "Fashion Design", "Interior Design", "Animation"],
};

export const INTERESTS_DATA: Record<string, string[]> = {
  Creative: ["Photography", "Music", "Art", "Design", "Film", "Writing", "Fashion"],
  Tech: ["AI", "Web3", "Startups", "Gaming", "Coding", "Gadgets"],
  Lifestyle: ["Fitness", "Yoga", "Cooking", "Travel", "Food", "Wellness"],
  Social: ["Volunteering", "Sustainability", "Social Impact", "Activism"],
  Entertainment: ["Movies", "Anime", "Stand-up", "Theatre", "Dance", "Music Festivals"],
  Sports: ["Cricket", "Football", "Basketball", "Badminton", "Pickleball", "Gym"],
};

export const LOOKING_FOR_OPTIONS = [
  { id: "collaborators", title: "Collaborators", description: "People to work on projects together", icon: "Handshake" },
  { id: "mentors", title: "Mentors", description: "Experienced folks for guidance & advice", icon: "Lightbulb" },
  { id: "opportunities", title: "Opportunities", description: "Jobs, gigs, or paid collaboration projects", icon: "Briefcase" },
  { id: "friends", title: "Friends", description: "People to hang out and vibe with", icon: "Heart" },
  { id: "feedback", title: "Feedback", description: "Honest critique on your work or ideas", icon: "MessageCircle" },
  { id: "co_founders", title: "Co-founders", description: "Partners to build a startup with", icon: "Rocket" },
  { id: "learning_partners", title: "Learning Partners", description: "Skill exchange and growing together", icon: "GraduationCap" },
] as const;
