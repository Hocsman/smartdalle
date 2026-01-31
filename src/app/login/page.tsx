import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md border-input bg-card/50">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-extrabold uppercase italic text-white">
                        Smart<span className="text-primary">Dalle</span>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Connecte-toi pour générer tes repas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="bg-secondary border-input text-white"
                                placeholder="ton@email.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">Mot de passe</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-secondary border-input text-white"
                                placeholder="********"
                            />
                        </div>
                        <div className="space-y-4">
                            <Button formAction={login} className="w-full font-bold text-md cursor-pointer hover:bg-primary/90">
                                Se connecter
                            </Button>
                            <Button
                                formAction={signup}
                                variant="outline"
                                className="w-full font-bold text-md border-primary text-primary hover:bg-primary hover:text-black cursor-pointer"
                            >
                                S'inscrire
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
