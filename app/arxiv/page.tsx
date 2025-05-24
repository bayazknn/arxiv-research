"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Workspace, ArxivQueryParams, ArxivPaper } from "@/types/workspace";
import { useForm, SubmitHandler } from "react-hook-form";
import { fetchAndFilterArxiv } from "@/utils/arxiv/arxiv-search";

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
  keyword: string;
  category: "cs.AI" | "cs.LG" | "math.CT" | "math.GR" | "math.NA" | "cs.GT" | "cs.NE";
};

export default function WorkspaceDetails() {
  const [arxivResults, setArxivResults] = useState<ArxivPaper[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const searchForm = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = useCallback(
    (data) => {
      const { keyword, category } = data;
      setIsLoading(true);

      fetchAndFilterArxiv(category, keyword, 10)
        .then((results) => {
          setArxivResults(results);
        })
        .catch((error) => {
          console.error("Error fetching arxiv search results:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [arxivResults]
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Search Form Section - Fixed height */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <Form {...searchForm}>
          <div className="space-y-4">
            <FormField
              name="keyword"
              control={searchForm.control}
              render={() => (
                <FormItem>
                  <FormLabel />
                  <FormControl>
                    <Input placeholder="Enter your search keyword" type="text" {...searchForm.register("keyword")} />
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
            <Button type="submit" onClick={searchForm.handleSubmit(onSubmit)}>
              Search
            </Button>
          </div>
        </Form>
      </div>

      {/* Results Section - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="space-y-4">
              <Skeleton className="h-[125px] w-full max-w-4xl rounded-xl" />
              <Skeleton className="h-[125px] w-full max-w-4xl rounded-xl" />
              <Skeleton className="h-[125px] w-full max-w-4xl rounded-xl" />
            </div>
          </div>
        ) : (
          <ArxivResultList arxivResults={arxivResults} />
        )}
      </div>
    </div>
  );
}
