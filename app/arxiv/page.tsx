"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Workspace, ArxivQueryParams, ArxivPaper } from "@/types/workspace";
import { useForm, SubmitHandler } from "react-hook-form";
import { fetchAndFilterArxiv } from "@/utils/arxiv/arxiv-search";
import { useQuery } from '@tanstack/react-query';
import { useArxivPaperStore } from "@/lib/arxiv-store";


import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ArxivResultList from "@/components/arxiv-result-list";
import { Skeleton } from "@/components/ui/skeleton";

type Inputs = {
  keyword?: string;
  category?: "" |"cs.AI" | "cs.LG" | "math.CT" | "math.GR" | "math.NA" | "cs.GT" | "cs.NE";
  maxResults: number;
};

export default function ArxivSearch() {
  const { arxivPapers, setArxivPapers } = useArxivPaperStore();
  const [searchQueries, setSearchQueries] = useState<Inputs>({
    keyword: "",
    category: "",
    maxResults: 10,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['arxiv-search', searchQueries?.keyword, searchQueries?.category, searchQueries?.maxResults],
    queryFn: async () => {
      if (!searchQueries.keyword && !searchQueries.category) {
        return []; // Return empty array if no keyword or category is provided
      }
      const fetchdata = await fetchAndFilterArxiv(searchQueries?.keyword, searchQueries?.category, searchQueries?.maxResults);
      console.log("react query fetchdata to store in zustand", fetchdata)
      setArxivPapers(fetchdata)
      console.log("arxiv paper after fetcihng in zustand", arxivPapers)
      return fetchdata;
    },
    refetchOnWindowFocus: true, // refetch on tab focus
    retry: 3, // retry failed request 3 times
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!searchQueries.keyword || !!searchQueries.category, // Enable query only if keyword or category is provided
  });


  useEffect(() => {
    if (data) {
      console.log("Arxiv form data:", data);
      setArxivPapers(data);
    }
  }, [data, setArxivPapers, setSearchQueries]);

  const searchForm = useForm<Inputs>({
    defaultValues: {
      keyword: "",
      category: "",
      maxResults: 10,
    }
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setSearchQueries(data);
    await refetch(); // Manually trigger the query
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Search Form Section - Fixed height */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <Form {...searchForm}>
          <div className="space-y-4">
            <FormField
              name="keyword"
              control={searchForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel />
                  <FormControl>
                    <Input placeholder="Enter your search keyword" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={searchForm.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categories</SelectLabel>
                        <SelectItem value="cs.AI">Artificial Intelligence</SelectItem>
                        <SelectItem value="cs.LG">Machine Learning</SelectItem>
                        <SelectItem value="math.CT">Category Theory</SelectItem>
                        <SelectItem value="math.GR">Group Theory</SelectItem>
                        <SelectItem value="math.NA">Numerical Analysis</SelectItem>
                        <SelectItem value="cs.GT">Computer Science and Game Theory</SelectItem>
                        <SelectItem value="cs.NE">Neural and Evolutionary Computing</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="maxResults"
              control={searchForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel />
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" onClick={searchForm.handleSubmit(onSubmit)} disabled={!searchForm.watch('keyword') && !searchForm.watch('category')}>
              Search
            </Button>
          </div>
        </Form>
      </div>

      {/* Results Section - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center p-8 ">
            <div className="space-y-4">
              <Skeleton className="h-[125px] w-full max-w-4xl rounded-xl" />
              <Skeleton className="h-[125px] w-full max-w-4xl rounded-xl" />
              <Skeleton className="h-[125px] w-full max-w-4xl rounded-xl p-8" >
                <span className="animate-pulse text-muted-foreground text-center">Loading...</span>
              </Skeleton>
              <Skeleton className="h-[125px] w-full max-w-4xl rounded-xl" />
              <Skeleton className="h-[125px] w-full max-w-4xl rounded-xl" />
            </div>
          </div>
        ) : (

            <ArxivResultList arxivResults={arxivPapers} />
        )}
      </div>
    </div>
  );
}
