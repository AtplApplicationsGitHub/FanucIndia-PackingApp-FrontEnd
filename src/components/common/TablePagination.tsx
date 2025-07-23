import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number; // default: 1
};

function getPageRange(current: number, total: number, sibling: number = 1): (number | "...")[] {
  // Builds a range like: [1, '...', 4, 5, 6, '...', 10]
  const range: (number | "...")[] = [];
  const min = Math.max(2, current - sibling);
  const max = Math.min(total - 1, current + sibling);

  range.push(1);
  if (min > 2) range.push("...");
  for (let i = min; i <= max; i++) range.push(i);
  if (max < total - 1) range.push("...");
  if (total > 1) range.push(total);

  // Remove duplicates and sort
  return [...new Set(range)].filter(x => typeof x === "number" ? x >= 1 && x <= total : true);
}

const TablePagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}) => {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageRange(currentPage, totalPages, siblingCount);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={currentPage === 1}
            tabIndex={currentPage === 1 ? -1 : 0}
            onClick={e => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
          />
        </PaginationItem>
        {pageNumbers.map((num, idx) =>
          num === "..." ? (
            <PaginationItem key={idx}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={num}>
              <PaginationLink
                href="#"
                isActive={num === currentPage}
                onClick={e => {
                  e.preventDefault();
                  if (num !== currentPage) onPageChange(Number(num));
                }}
              >
                {num}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={currentPage === totalPages}
            tabIndex={currentPage === totalPages ? -1 : 0}
            onClick={e => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default TablePagination;
