import { type Profile } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Building } from "lucide-react";

export default function ProfileHero({ profile }: { profile: Profile }) {
  const { name, title, bio, photoUrl, contactInfo } = profile;

  return (
    <div className="relative bg-slate-50">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <Avatar className="h-48 w-48">
            <AvatarImage src={photoUrl} alt={name} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-4xl font-bold">{name}</h1>
            <h2 className="text-xl text-slate-600">{title}</h2>
            <p className="max-w-2xl text-slate-600">{bio}</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="h-4 w-4" />
                <span>{contactInfo.email}</span>
              </div>
              {contactInfo.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-4 w-4" />
                  <span>{contactInfo.phone}</span>
                </div>
              )}
              {contactInfo.office && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Building className="h-4 w-4" />
                  <span>{contactInfo.office}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
