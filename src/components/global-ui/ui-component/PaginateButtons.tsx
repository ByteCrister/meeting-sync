import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type propTypes = {
  handlePaginatePage: (newPage: number) => void;
  currentPage: number;
  maxItems: number;
  totalItems: number;
};

const PaginateButtons = ({
  handlePaginatePage,
  currentPage,
  maxItems,
  totalItems,
}: propTypes) => {
  const totalPages = Math.ceil(totalItems / maxItems);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const getPageNumbers = () => {
    if (totalPages <= 3)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 2) return [1, 2, 3, "..."];
    if (currentPage >= totalPages - 1)
      return ["...", totalPages - 2, totalPages - 1, totalPages];
    return ["...", currentPage - 1, currentPage, currentPage + 1, "..."];
  };

  return (
    <Pagination>
      <PaginationContent className="mt-6 flex items-center space-x-3 p-4 rounded-lg">
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            onClick={(e) => {
              e.preventDefault();
              if (!isFirstPage) handlePaginatePage(currentPage - 1);
            }}
            className={`rounded-full p-2 transition-all duration-200 shadow hover:scale-105 ${
              isFirstPage
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer text-gray-700 hover:bg-blue-50"
            }`}
          />
        </PaginationItem>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          <PaginationItem key={index}>
            {page === "..." ? (
              <PaginationEllipsis className="text-gray-500" />
            ) : (
              <PaginationLink
                isActive={currentPage === page}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                  currentPage === page
                    ? "bg-gray-600 text-white shadow-lg hover:bg-gray-800 transform scale-105"
                    : "bg-white text-gray-800 border-gray-300 hover:bg-blue-50 hover:text-blue-600"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handlePaginatePage(Number(page));
                }}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            onClick={(e) => {
              e.preventDefault();
              if (!isLastPage) handlePaginatePage(currentPage + 1);
            }}
            className={`rounded-full p-2 transition-all duration-200 shadow hover:scale-105 ${
              isLastPage
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer text-gray-700 hover:bg-blue-50"
            }`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginateButtons;
