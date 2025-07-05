import React, { useMemo } from 'react';
import { useTable, useSortBy, usePagination, useFilters } from 'react-table';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format } from 'date-fns';
import { CSVLink } from 'react-csv';
import CallStatusBadge from './CallStatusBadge';
import { CallRecord } from '../types/CallRecord';

interface CallHistoryTableProps {
  callHistory: CallRecord[];
}

const CallHistoryTable: React.FC<CallHistoryTableProps> = ({ callHistory }) => {
  const columns = useMemo(
    () => [
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
      {
        Header: 'Call Date',
        accessor: 'callDate',
        Cell: ({ value }: { value: string }) => format(new Date(value), 'yyyy-MM-dd'),
      },
      {
        Header: 'Start Time',
        accessor: 'startTime',
        Cell: ({ value }: { value: string }) => format(new Date(value), 'HH:mm:ss'),
      },
      {
        Header: 'End Time',
        accessor: 'endTime',
        Cell: ({ value }: { value: string }) => (value ? format(new Date(value), 'HH:mm:ss') : '-'),
      },
      {
        Header: 'Duration',
        accessor: 'duration',
        Cell: ({ value }: { value: number }) => `${value} sec`,
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }: { value: string }) => <CallStatusBadge status={value} />,
        Filter: SelectColumnFilter,
        filter: 'includes',
      },
    ],
    []
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
      data: callHistory,
      initialState: { pageSize: 10 },
    },
    useFilters,
    useSortBy,
    usePagination
  );

  const csvData = callHistory.map(record => ({
    Case_Id: record.caseId,
    Customer_Name: record.customerName,
    Phonenumber1: record.phoneNumber,
    Handel: record.handel,
    Call_Date: format(new Date(record.callDate), 'yyyy-MM-dd'),
    Start_Time: format(new Date(record.startTime), 'HH:mm:ss'),
    End_Time: record.endTime ? format(new Date(record.endTime), 'HH:mm:ss') : '',
    Duration: record.duration,
    Respons_Code: record.status
  }));

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Call History</h2>
        <CSVLink 
          data={csvData} 
          filename={`call-history-${format(new Date(), 'yyyy-MM-dd')}.csv`}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <Download size={16} className="mr-2" />
          Export CSV
        </CSVLink>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 mb-4">
          {headerGroups[0].headers.map((column: any) => (
            column.Filter ? (
              <div key={column.id} className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Filter by {column.render('Header')}
                </label>
                {column.render('Filter')}
              </div>
            ) : null
          ))}
        </div>

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
                <tr {...row.getRowProps()} className="hover:bg-gray-700 transition-colors">
                  {row.cells.map((cell: any) => (
                    <td
                      {...cell.getCellProps()}
                      className="px-4 py-3 text-sm text-gray-200 whitespace-nowrap"
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
    </div>
  );
};

// Filter component for status
function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}: any) {
  const options = useMemo(() => {
    const optionSet = new Set();
    preFilteredRows.forEach((row: any) => {
      optionSet.add(row.values[id]);
    });
    return [...optionSet.values()];
  }, [id, preFilteredRows]);

  return (
    <select
      className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
      value={filterValue}
      onChange={(e) => setFilter(e.target.value || undefined)}
    >
      <option value="">All</option>
      {options.map((option: any, i: number) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default CallHistoryTable;