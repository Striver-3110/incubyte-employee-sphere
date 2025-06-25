import { 
  Linkedin, Github, Twitter, Globe, Youtube, Twitch, 
  MessageSquare, FileCode, BookOpen, Coffee, Server, Code, Database 
} from "lucide-react";

export const socialPlatforms = [
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
  { id: "github", name: "GitHub", icon: Github },
  { id: "twitter", name: "Twitter", icon: Twitter },
  { id: "website", name: "Personal Website", icon: Globe },
  { id: "stackoverflow", name: "Stack Overflow", icon: FileCode },
  { id: "medium", name: "Medium", icon: BookOpen },
  { id: "dev", name: "DEV Community", icon: Code },
  { id: "hashnode", name: "Hashnode", icon: Database },
  { id: "youtube", name: "YouTube", icon: Youtube },
  { id: "twitch", name: "Twitch", icon: Twitch },
  { id: "discord", name: "Discord", icon: MessageSquare },
  { id: "kaggle", name: "Kaggle", icon: Server },
  { id: "buymeacoffee", name: "Buy Me a Coffee", icon: Coffee },
];

export const getPlatformIcon = (platformName: string) => {
  const platform = socialPlatforms.find(p => 
    p.name.toLowerCase() === platformName.toLowerCase() ||
    p.id.toLowerCase() === platformName.toLowerCase()
  );
  
  return platform ? platform.icon : Globe;
};
