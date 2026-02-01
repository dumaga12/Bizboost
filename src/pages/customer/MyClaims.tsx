import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Ticket, Loader2 } from "lucide-react";
import { useClaims } from "@/hooks/useDeals";
import ClaimQR from "@/components/ClaimQR";

const MyClaims = () => {
    const { data: claims, isLoading } = useClaims();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <Link to="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <Ticket className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">My Claimed Deals</h1>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : !claims || claims.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">You haven't claimed any deals yet.</p>
                            <Link to="/browse">
                                <Button className="mt-4">Explore Deals</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {claims.map((claim: any) => (
                            <div key={claim.id} className="space-y-4">
                                <Card className={claim.is_redeemed ? "opacity-60 bg-muted" : ""}>
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <Badge variant={claim.is_redeemed ? "secondary" : "default"}>
                                                {claim.is_redeemed ? "Redeemed" : "Active"}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                Claimed {new Date(claim.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <h3 className="text-xl font-bold mb-2">Deal #{claim.dealId}</h3>
                                        {claim.is_redeemed ? (
                                            <p className="text-sm text-muted-foreground italic">
                                                This code was redeemed on {new Date(claim.redeemed_at).toLocaleString()}
                                            </p>
                                        ) : (
                                            <ClaimQR code={claim.redemption_code} title={`Redeem Deal #${claim.dealId}`} />
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyClaims;
