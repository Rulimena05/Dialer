import React, { useMemo } from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Customer } from '../types/Customer';

interface CustomerTableProps {
  customers: Customer[];
  onSelectCustomers: (selected: Customer[]) => void;
  onCustomerClick: (customer: Customer) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ customers, onSelectCustomers, onCustomerClick }) => {
  const [selectedRows, setSelectedRows] = React.useState<Record<string, boolean>>({});

  const columns = useMemo(
    () => [
      {
        Header: ({ getToggleAllRowsSelected }: any) => (
          <div className="px-1">
            <input
              type="checkbox"
              className="w-4 h-4"
              onChange={(e) => {
                const isSelected = e.target.checked;
                const newSelected: Record<string, boolean> = {};
                customers.forEach((customer) => {
                  newSelected[customer.caseId] = isSelected;
                });
                setSelectedRows(newSelected);
                onSelectCustomers(isSelected ? customers : []);
              }}
              checked={
                customers.length > 0 &&
                customers.every((customer) => selectedRows[customer.caseId])
              }
            />
          </div>
        ),
        accessor: 'select',
        Cell: ({ row }: any) => (
          <div className="px-1">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={selectedRows[row.original.caseId] || false}
              onChange={() => {
                setSelectedRows((prev) => {
                  const newSelected = { ...prev };
                  if (newSelected[row.original.caseId]) {
                    delete newSelected[row.original.caseId];
                  } else {
                    newSelected[row.original.caseId] = true;
                  }
                  
                  onSelectCustomers(
                    Object.keys(newSelected).map(
                      (id) => customers.find((c) => c.caseId === id)!
                    ).filter(Boolean)
                  );
                  
                  return newSelected;
                });
              }}
            />
          </div>
        ),
        disableSortBy: true,
      },
      {
        Header: 'Case ID',
        accessor: 'caseId',
      },
      {
        Header: 'Customer Name',
        accessor: 'customerName',
      },
      {
        Header: 'Phone Number',
        accessor: 'phoneNumber',
      },
      {
        Header: 'Handel',
        accessor: 'handel',
      },
    ],
    [customers, onSelectCustomers, selectedRows]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    state: { pageIndex },
  } = useTable(
    {
      columns,
      data: customers,
      initialState: { pageSize: 10 },
    },
    useSortBy,
    usePagination
  );

  return (
    <div className="overflow-x-auto">
      <table {...getTableProps()} className="min-w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <thead className="bg-gray-700">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: any) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.render('Header')}</span>
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="divide-y divide-gray-700">
          {page.map((row: any) => {
            prepareRow(row);
            return (
              <tr 
                {...row.getRowProps()} 
                className="hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => onCustomerClick(row.original)}
              >
                {row.cells.map((cell: any) => (
                  <td
                    {...cell.getCellProps()}
                    className="px-4 py-3 text-sm text-gray-200 whitespace-nowrap"
                    onClick={(e) => {
                      if (cell.column.id === 'select') {
                        e.stopPropagation();
                      }
                    }}
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="py-3 flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="disabled:opacity-50 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-200 bg-gray-800 hover:bg-gray-700"
          >
            Previous
          </button>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="disabled:opacity-50 ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-200 bg-gray-800 hover:bg-gray-700"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">
              Page <span className="font-medium">{pageIndex + 1}</span> of{' '}
              <span className="font-medium">{pageOptions.length}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className="disabled:opacity-50 relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className="disabled:opacity-50 relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTable;