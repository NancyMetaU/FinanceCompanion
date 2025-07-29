import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "@/lib/ui/card";
import { ArrowRight } from "lucide-react";
import AuthModal from "../auth-page-components/AuthModal";

const AuthAwareFeatureCard = ({ title, path, desc, icon, color, delay }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCardClick = () => {
        if (user) {
            navigate(path);
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <div
                onClick={handleCardClick}
                className={`group animate-fade-in-up ${delay} cursor-pointer`}
            >
                <Card
                    className="relative h-full flex flex-col items-center text-center pt-6
                            pb-8 px-6 hover:shadow-xl transition-all duration-300
                            hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
                >
                    <header
                        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color} rounded-t-md`}
                    />

                    <figure className="mt-6 relative">
                        <div
                            className="absolute inset-0 bg-slate-100 rounded-full opacity-0 group-hover:opacity-20
                                    scale-0 group-hover:scale-150 transition-all duration-700"
                        />
                        {icon}
                    </figure>

                    <CardContent className="pt-4 pb-6 px-4 flex flex-col items-center">
                        <h3 className="text-2xl font-bold text-slate-800 mb-5">{title}</h3>
                        <p className="text-m text-muted-foreground leading-relaxed mb-6">
                            {desc}
                        </p>

                        <section
                            className="mt-auto flex items-center text-royal opacity-0 group-hover:opacity-100
                                    translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                        >
                            <span className="mr-2 font-medium">Explore</span>
                            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </section>
                    </CardContent>
                </Card>
            </div>

            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default AuthAwareFeatureCard;
