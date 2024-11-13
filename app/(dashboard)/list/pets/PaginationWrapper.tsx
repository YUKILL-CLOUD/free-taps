"use client";

import Pagination from "@/app/components/front/Pagination";
import { useRouter, useSearchParams } from "next/navigation";

type PaginationWrapperProps = {
  page: number;
  count: number;
};

export default function PaginationWrapper({ page, count }: PaginationWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <Pagination 
      page={page} 
      count={count} 
      onPageChange={handlePageChange}
    />
  );
}
