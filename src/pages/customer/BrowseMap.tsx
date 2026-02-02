import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Map as MapIcon, Loader2 } from "lucide-react";
import { useDeals } from "@/hooks/useDeals";
import { Card } from "@/components/ui/card";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
    width: "100%",
    height: "600px",
};

// Default center (Lagos, Nigeria) - can be updated to user's location
const defaultCenter = {
    lat: 6.5244,
    lng: 3.3792,
};

const BrowseMap = () => {
    const { data: deals } = useDeals();
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    });

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 text-primary">
                        <MapIcon className="h-6 w-6" />
                        <h1 className="text-xl font-bold">Near Me Map</h1>
                    </div>
                    <div />
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <Card className="overflow-hidden border-2">
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={defaultCenter}
                        zoom={12}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                    >
                        {/* Child components, such as markers, info windows, etc. */}
                        {deals?.map((deal, index) => {
                            // Generates random lat/lng near Lagos for demo purposes if no coordinates exist
                            // Ideally, deals should have lat/lng
                            const lat = 6.5244 + (Math.random() - 0.5) * 0.1;
                            const lng = 3.3792 + (Math.random() - 0.5) * 0.1;

                            return (
                                <Marker
                                    key={deal.id || index}
                                    position={{ lat, lng }}
                                    title={deal.title}
                                />
                            );
                        })}
                    </GoogleMap>
                </Card>
            </div>
        </div>
    );
};

export default BrowseMap;