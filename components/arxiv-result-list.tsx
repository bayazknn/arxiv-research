import { ArxivPaper } from "@/types/workspace";
import ArxivResult from "./arxiv-result";

interface ArxivResultListProps {
  arxivResults: ArxivPaper[];
}

const ArxivResultList: React.FC<ArxivResultListProps> = ({ arxivResults }: ArxivResultListProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="space-y-4">
        {arxivResults.length > 0 ? (
          arxivResults.map((paper, index) => <ArxivResult key={`${paper.link}-${index}`} paper={paper} />)
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No papers found. Try searching for something!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArxivResultList;
