import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClaimQRProps {
    code: string;
    title: string;
}

const ClaimQR: React.FC<ClaimQRProps> = ({ code, title }) => {
    return (
        <Card className="max-w-sm mx-auto text-center">
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                <Badge variant="outline" className="mt-2 text-lg py-1 px-4 font-mono">
                    {code}
                </Badge>
            </CardHeader>
            <CardContent className="flex justify-center p-6 bg-white rounded-b-lg">
                <QRCodeSVG value={code} size={200} level="H" includeMargin={true} />
            </CardContent>
            <p className="text-xs text-muted-foreground pb-4 px-4">
                Show this QR code to the business owner to redeem your deal.
            </p>
        </Card>
    );
};

export default ClaimQR;
