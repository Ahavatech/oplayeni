import { type Profile } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Building } from "lucide-react";

export default function ProfileHero({ profile }: { profile: Profile }) {
  const { name, title, bio, photoUrl, contactInfo } = profile;

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row gap-12 items-start max-w-6xl mx-auto">
          {/* Left side - Avatar and Identity */}
          <div className="w-full md:w-1/3 flex flex-col items-center md:items-start space-y-6">
            <Avatar className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-white shadow-xl">
              <AvatarImage src={photoUrl} alt={name} className="object-cover" />
              <AvatarFallback className="text-4xl">{name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{name}</h1>
              <h2 className="text-xl font-medium text-blue-600">{title}</h2>
            </div>
          </div>

          {/* Right side - Bio and Contact */}
          <div className="flex-1 space-y-8">
            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
              <p>{bio}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 text-gray-600">
              <a href={`mailto:${contactInfo.email}`} 
                className="flex items-center gap-3 hover:text-blue-600 transition-colors">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium truncate">{contactInfo.email}</span>
              </a>
              
              {contactInfo.phone && (
                <a href={`tel:${contactInfo.phone}`} 
                  className="flex items-center gap-3 hover:text-blue-600 transition-colors">
                  <Phone className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{contactInfo.phone}</span>
                </a>
              )}
              
              {contactInfo.office && (
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{contactInfo.office}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
