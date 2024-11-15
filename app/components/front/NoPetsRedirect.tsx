'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface NoPetsRedirectProps {
  hasPets: boolean;
}

export default function NoPetsRedirect({ hasPets }: NoPetsRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    console.log('NoPetsRedirect - hasPets:', hasPets);
    if (!hasPets) {
      toast.info("Please register a pet first to use our services");
      router.push('/list/pets');
    }
  }, [hasPets, router]);

  return null;
}