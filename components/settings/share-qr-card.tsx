'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Share2, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

export function ShareQRCodeCard() {
    const [url, setUrl] = useState('https://tuval.dafuk.pro/');
    const [copied, setCopied] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUrl(window.location.origin);
        }
    }, []);

    const handleCopy = () => {
        if (!url) return;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-6 rounded-3xl bg-white/60 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-500">
                    <Share2 size={24} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-tuval-label">{t('share_website')}</span>
                    <span className="text-sm text-tuval-navy/60">{t('share_invite')}</span>
                </div>
            </div>

            <div className="flex flex-col items-center gap-6 py-2">
                {/* QR Code container */}
                <div className="relative rounded-2xl bg-white p-4 shadow-inner ring-1 ring-black/5">
                    {url ? (
                        <QRCodeSVG
                            value={url}
                            size={160}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "/favicon.ico", // Attempting to use favicon as center logo if exists
                                x: undefined,
                                y: undefined,
                                height: 30,
                                width: 30,
                                excavate: true,
                            }}
                        />
                    ) : (
                        <div className="h-[160px] w-[160px] animate-pulse rounded-lg bg-gray-100" />
                    )}
                </div>

                <div className="flex w-full flex-col gap-3">
                    <div className="flex items-center gap-2 rounded-xl bg-black/5 p-3 px-4">
                        <span className="flex-1 truncate text-xs text-tuval-navy/70 font-mono">
                            {url || 'Loading...'}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-tuval-label hover:text-tuval-navy"
                            onClick={handleCopy}
                            aria-label="Copy link"
                        >
                            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
