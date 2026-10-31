/**
 * DataTable.jsx
 * Standardized enterprise SaaS data table component inspired by Stripe/Linear.
 * Provides consistent typography, padding, hover states, empty state, and pagination.
 */

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyState = null,
  pagination = null,
  onRowClick = null,
  keyField = 'id',
}) => {
  return (
    <div className="shared-data-table-container">
      {isLoading ? (
        <div className="shared-data-table__loading">
          <Loader2 size={26} className="spin" />
          <span>Loading records...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="shared-data-table__empty">
          {emptyState || (
            <div className="table-empty-default">
              <p>No records found.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="shared-data-table__responsive">
          <table className="shared-data-table">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={col.key || idx}
                    style={{
                      width: col.width || 'auto',
                      textAlign: col.align || 'left',
                      paddingRight: col.align === 'right' ? '20px' : '16px',
                    }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIdx) => (
                <tr
                  key={row[keyField] || rowIdx}
                  className={onRowClick ? 'shared-data-table__row--clickable' : ''}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      style={{
                        textAlign: col.align || 'left',
                        paddingRight: col.align === 'right' ? '20px' : '16px',
                      }}
                      onClick={col.stopClickPropagation ? (e) => e.stopPropagation() : undefined}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && pagination && data.length > 0 && (
        <div className="shared-data-table__pagination">
          <span className="shared-data-table__pagination-info">
            Showing <strong>{(pagination.page - 1) * pagination.limit + 1}</strong> to{' '}
            <strong>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of{' '}
            <strong>{pagination.total}</strong> results
          </span>

          <div className="shared-data-table__pagination-controls">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              <ChevronLeft size={15} />
              <span>Previous</span>
            </button>
            <span className="shared-data-table__page-indicator">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              disabled={pagination.page >= (pagination.totalPages || 1)}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              <span>Next</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
