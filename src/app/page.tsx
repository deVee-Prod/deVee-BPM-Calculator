"use client";
import dynamic from 'next/dynamic';

const BPMApp = dynamic(() => import('./bpm-app'), { ssr: false });

export default function Page() {
  return <BPMApp />;
}
