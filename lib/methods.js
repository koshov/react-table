'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (Base) {
  return function (_Base) {
    _inherits(_class, _Base);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    _createClass(_class, [{
      key: 'getResolvedState',
      value: function getResolvedState(props, state) {
        var resolvedState = _extends({}, _utils2.default.compactObject(this.state), _utils2.default.compactObject(this.props), _utils2.default.compactObject(state), _utils2.default.compactObject(props));
        return resolvedState;
      }
    }, {
      key: 'getDataModel',
      value: function getDataModel(newState, dataChanged) {
        var _this2 = this;

        var columns = newState.columns,
            _newState$pivotBy = newState.pivotBy,
            pivotBy = _newState$pivotBy === undefined ? [] : _newState$pivotBy,
            data = newState.data,
            resolveData = newState.resolveData,
            pivotIDKey = newState.pivotIDKey,
            pivotValKey = newState.pivotValKey,
            subRowsKey = newState.subRowsKey,
            aggregatedKey = newState.aggregatedKey,
            nestingLevelKey = newState.nestingLevelKey,
            originalKey = newState.originalKey,
            indexKey = newState.indexKey,
            groupedByPivotKey = newState.groupedByPivotKey,
            SubComponent = newState.SubComponent;

        // Determine if there are Header Groups

        var hasHeaderGroups = columns.some(function (column) {
          return column.columns;
        });

        // Find the expander column which could be deep in tree of columns
        var allColumns = _utils2.default.iterTree(columns, 'columns');
        var expanderColumn = _utils2.default.getFirstDefined(allColumns);

        // If we have SubComponent's we need to make sure we have an expander column
        var hasSubComponentAndNoExpanderColumn = SubComponent && !expanderColumn;
        var columnsWithExpander = hasSubComponentAndNoExpanderColumn ? [{ expander: true }].concat(_toConsumableArray(columns)) : [].concat(_toConsumableArray(columns));

        var makeDecoratedColumn = function makeDecoratedColumn(column, parentColumn) {
          var dcol = void 0;
          if (column.expander) {
            dcol = _extends({}, _this2.props.column, _this2.props.expanderDefaults, column);
          } else {
            dcol = _extends({}, _this2.props.column, _this2.props.column, column);
          }

          // Ensure minWidth is not greater than maxWidth if set
          if (dcol.maxWidth < dcol.minWidth) {
            dcol.minWidth = dcol.maxWidth;
          }

          if (parentColumn) {
            dcol.parentColumn = parentColumn;
          }

          // First check for string accessor
          if (typeof dcol.accessor === 'string') {
            dcol.id = dcol.id || dcol.accessor;
            var accessorString = dcol.accessor;
            dcol.accessor = function (row) {
              return _utils2.default.get(row, accessorString);
            };
            return dcol;
          }

          // Fall back to functional accessor (but require an ID)
          if (dcol.accessor && !dcol.id) {
            console.warn(dcol);
            throw new Error('A column id is required if using a non-string accessor for column above.');
          }

          // Fall back to an undefined accessor
          if (!dcol.accessor) {
            dcol.accessor = function () {
              return undefined;
            };
          }

          return dcol;
        };

        var allDecoratedColumns = [];

        // Decorate the columns
        var decorateAndAddToAll = function decorateAndAddToAll(columns, parentColumn) {
          return columns.map(function (column) {
            var decoratedColumn = makeDecoratedColumn(column, parentColumn);
            if (column.columns) {
              decoratedColumn.columns = decorateAndAddToAll(column.columns, column);
            }

            allDecoratedColumns.push(decoratedColumn);
            return decoratedColumn;
          });
        };

        var decoratedColumns = decorateAndAddToAll(columnsWithExpander);
        var mapVisibleColumns = function mapVisibleColumns(columns) {
          return columns.map(function (column) {
            if (column.columns) {
              var visibleSubColumns = column.columns.filter(function (d) {
                return pivotBy.indexOf(d.id) > -1 ? false : _utils2.default.getFirstDefined(d.show, true);
              });
              return _extends({}, column, {
                columns: mapVisibleColumns(visibleSubColumns)
              });
            }
            return column;
          });
        };

        var filterVisibleColumns = function filterVisibleColumns(columns) {
          return columns.filter(function (column) {
            return column.columns ? column.columns.length : pivotBy.indexOf(column.id) > -1 ? false : _utils2.default.getFirstDefined(column.show, true);
          });
        };

        // Build the full array of visible columns - this is an array that contains all columns that
        // are not hidden via pivoting
        var allVisibleColumns = filterVisibleColumns(mapVisibleColumns(decoratedColumns.slice()));

        // Find any custom pivot location
        var pivotIndex = allVisibleColumns.findIndex(function (col) {
          return col.pivot;
        });

        // Handle Pivot Columns
        if (pivotBy.length) {
          // Retrieve the pivot columns in the correct pivot order
          var pivotColumns = [];
          pivotBy.forEach(function (pivotID) {
            var found = allDecoratedColumns.find(function (d) {
              return d.id === pivotID;
            });
            if (found) {
              pivotColumns.push(found);
            }
          });

          var PivotParentColumn = pivotColumns.reduce(function (prev, current) {
            return prev && prev === current.parentColumn && current.parentColumn;
          }, pivotColumns[0].parentColumn);

          var PivotGroupHeader = hasHeaderGroups && PivotParentColumn.Header;
          PivotGroupHeader = PivotGroupHeader || function () {
            return _react2.default.createElement(
              'strong',
              null,
              'Pivoted'
            );
          };

          var pivotColumnGroup = {
            Header: PivotGroupHeader,
            columns: pivotColumns.map(function (col) {
              return _extends({}, _this2.props.pivotDefaults, col, {
                pivoted: true
              });
            })

            // Place the pivotColumns back into the visibleColumns
          };if (pivotIndex >= 0) {
            pivotColumnGroup = _extends({}, allVisibleColumns[pivotIndex], pivotColumnGroup);
            allVisibleColumns.splice(pivotIndex, 1, pivotColumnGroup);
          } else {
            allVisibleColumns.unshift(pivotColumnGroup);
          }
        }

        // Determine maximum column depth
        var getDeepestBranch = function getDeepestBranch(column) {
          if (column.columns) {
            var subBranches = column.columns.map(getDeepestBranch);
            var deepestBranch = void 0;
            subBranches.forEach(function (branch) {
              if (!deepestBranch || deepestBranch.length < branch.length) {
                deepestBranch = branch;
              }
            });
            return [column].concat(deepestBranch);
          }
          return [column];
        };
        var columnDepths = allVisibleColumns.map(getDeepestBranch).map(function (branch) {
          return branch.length;
        });
        var maxDepth = Math.max.apply(Math, _toConsumableArray(columnDepths));

        // Pad last column up to maximum depth
        var lastColumn = _utils2.default.last(allVisibleColumns);
        var lastColumnDepth = getDeepestBranch(lastColumn).length;
        if (lastColumnDepth < maxDepth) {
          for (var i = 0; i < maxDepth - lastColumnDepth; i++) {
            allVisibleColumns[allVisibleColumns.length - 1] = _extends({}, this.props.column, {
              columns: [_utils2.default.last(allVisibleColumns)]
            });
          }
        }

        // Build Visible Columns and Header Groups
        var allColumnHeaders = [];

        var addHeader = function addHeader(column) {
          var level = 0;

          // If this column has children, push them first and add this column to the next level
          if (column.columns) {
            var childLevels = column.columns.map(addHeader);
            level = Math.max.apply(Math, _toConsumableArray(childLevels)) + 1;
          }

          // Add spans above columns without parents (orphans) to fill the space above them
          if (allColumnHeaders.length <= level) allColumnHeaders.push([]);
          if (level > 0) {
            // The spans need to contain the shifted headers as children. This finds all of the
            // columns in the lower level between the first child of this column and the last child
            // of the preceding column (if there is one)
            var lowerLevel = allColumnHeaders[level - 1];
            var precedingColumn = _utils2.default.last(allColumnHeaders[level]);

            var indexOfFirstChildInLowerLevel = lowerLevel.indexOf(column.columns[0]);
            var indexAfterLastChildInPrecedingColumn = precedingColumn ? lowerLevel.indexOf(_utils2.default.last(precedingColumn.columns)) + 1 : 0;

            // If there are ophans, add a span above them
            var orphans = lowerLevel.slice(indexAfterLastChildInPrecedingColumn, indexOfFirstChildInLowerLevel);

            if (orphans.length) {
              allColumnHeaders[level].push(_extends({}, _this2.props.column, {
                columns: orphans
              }));
            }
          }

          allColumnHeaders[level].push(column);

          return level;
        };

        allVisibleColumns.forEach(addHeader);

        // visibleColumns is an array containing column definitions for the bottom row of TH elements
        var visibleColumns = allColumnHeaders.shift();
        var headerGroups = allColumnHeaders.reverse();

        // Access the data
        var accessRow = function accessRow(d, i) {
          var _row;

          var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

          var row = (_row = {}, _defineProperty(_row, originalKey, d), _defineProperty(_row, indexKey, i), _defineProperty(_row, subRowsKey, d[subRowsKey]), _defineProperty(_row, nestingLevelKey, level), _row);
          allDecoratedColumns.forEach(function (column) {
            if (column.expander) return;
            row[column.id] = column.accessor(d);
          });
          if (row[subRowsKey]) {
            row[subRowsKey] = row[subRowsKey].map(function (d, i) {
              return accessRow(d, i, level + 1);
            });
          }
          return row;
        };

        // // If the data hasn't changed, just use the cached data
        var resolvedData = this.resolvedData;
        // If the data has changed, run the data resolver and cache the result
        if (!this.resolvedData || dataChanged) {
          resolvedData = resolveData(data);
          this.resolvedData = resolvedData;
        }
        // Use the resolved data
        resolvedData = resolvedData.map(function (d, i) {
          return accessRow(d, i);
        });

        // TODO: Make it possible to fabricate nested rows without pivoting
        var aggregatingColumns = visibleColumns.filter(function (d) {
          return !d.expander && d.aggregate;
        });

        // If pivoting, recursively group the data
        var aggregate = function aggregate(rows) {
          var aggregationValues = {};
          aggregatingColumns.forEach(function (column) {
            var values = rows.map(function (d) {
              return d[column.id];
            });
            aggregationValues[column.id] = column.aggregate(values, rows);
          });
          return aggregationValues;
        };
        if (pivotBy.length) {
          var groupRecursively = function groupRecursively(rows, keys) {
            var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            // This is the last level, just return the rows
            if (i === keys.length) {
              return rows;
            }
            // Group the rows together for this level
            var groupedRows = Object.entries(_utils2.default.groupBy(rows, keys[i])).map(function (_ref) {
              var _ref3;

              var _ref2 = _slicedToArray(_ref, 2),
                  key = _ref2[0],
                  value = _ref2[1];

              return _ref3 = {}, _defineProperty(_ref3, pivotIDKey, keys[i]), _defineProperty(_ref3, pivotValKey, key), _defineProperty(_ref3, keys[i], key), _defineProperty(_ref3, subRowsKey, value), _defineProperty(_ref3, nestingLevelKey, i), _defineProperty(_ref3, groupedByPivotKey, true), _ref3;
            });
            // Recurse into the subRows
            groupedRows = groupedRows.map(function (rowGroup) {
              var _extends2;

              var subRows = groupRecursively(rowGroup[subRowsKey], keys, i + 1);
              return _extends({}, rowGroup, (_extends2 = {}, _defineProperty(_extends2, subRowsKey, subRows), _defineProperty(_extends2, aggregatedKey, true), _extends2), aggregate(subRows));
            });
            return groupedRows;
          };
          resolvedData = groupRecursively(resolvedData, pivotBy);
        }

        return _extends({}, newState, {
          resolvedData: resolvedData,
          visibleColumns: visibleColumns,
          headerGroups: headerGroups,
          allDecoratedColumns: allDecoratedColumns,
          hasHeaderGroups: hasHeaderGroups
        });
      }
    }, {
      key: 'getSortedData',
      value: function getSortedData(resolvedState) {
        var manual = resolvedState.manual,
            sorted = resolvedState.sorted,
            filtered = resolvedState.filtered,
            defaultFilterMethod = resolvedState.defaultFilterMethod,
            resolvedData = resolvedState.resolvedData,
            visibleColumns = resolvedState.visibleColumns,
            allDecoratedColumns = resolvedState.allDecoratedColumns;


        var sortMethodsByColumnID = {};

        allDecoratedColumns.filter(function (col) {
          return col.sortMethod;
        }).forEach(function (col) {
          sortMethodsByColumnID[col.id] = col.sortMethod;
        });

        // Resolve the data from either manual data or sorted data
        return {
          sortedData: manual ? resolvedData : this.sortData(this.filterData(resolvedData, filtered, defaultFilterMethod, visibleColumns), sorted, sortMethodsByColumnID)
        };
      }
    }, {
      key: 'fireFetchData',
      value: function fireFetchData() {
        this.props.onFetchData(this.getResolvedState(), this);
      }
    }, {
      key: 'getPropOrState',
      value: function getPropOrState(key) {
        return _utils2.default.getFirstDefined(this.props[key], this.state[key]);
      }
    }, {
      key: 'getStateOrProp',
      value: function getStateOrProp(key) {
        return _utils2.default.getFirstDefined(this.state[key], this.props[key]);
      }
    }, {
      key: 'filterData',
      value: function filterData(data, filtered, defaultFilterMethod, visibleColumns) {
        var _this3 = this;

        var filteredData = data;

        if (filtered.length) {
          filteredData = filtered.reduce(function (filteredSoFar, nextFilter) {
            var column = visibleColumns.find(function (x) {
              return x.id === nextFilter.id;
            });

            // Don't filter hidden columns or columns that have had their filters disabled
            if (!column || column.filterable === false) {
              return filteredSoFar;
            }

            var filterMethod = column.filterMethod || defaultFilterMethod;

            // If 'filterAll' is set to true, pass the entire dataset to the filter method
            if (column.filterAll) {
              return filterMethod(nextFilter, filteredSoFar, column);
            }
            return filteredSoFar.filter(function (row) {
              return filterMethod(nextFilter, row, column);
            });
          }, filteredData);

          // Apply the filter to the subrows if we are pivoting, and then
          // filter any rows without subcolumns because it would be strange to show
          filteredData = filteredData.map(function (row) {
            if (!row[_this3.props.subRowsKey]) {
              return row;
            }
            return _extends({}, row, _defineProperty({}, _this3.props.subRowsKey, _this3.filterData(row[_this3.props.subRowsKey], filtered, defaultFilterMethod, visibleColumns)));
          }).filter(function (row) {
            if (!row[_this3.props.subRowsKey]) {
              return true;
            }
            return row[_this3.props.subRowsKey].length > 0;
          });
        }

        return filteredData;
      }
    }, {
      key: 'sortData',
      value: function sortData(data, sorted) {
        var _this4 = this;

        var sortMethodsByColumnID = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (!sorted.length) {
          return data;
        }

        var sortedData = (this.props.orderByMethod || _utils2.default.orderBy)(data, sorted.map(function (sort) {
          // Support custom sorting methods for each column
          if (sortMethodsByColumnID[sort.id]) {
            return function (a, b) {
              return sortMethodsByColumnID[sort.id](a[sort.id], b[sort.id], sort.desc);
            };
          }
          return function (a, b) {
            return _this4.props.defaultSortMethod(a[sort.id], b[sort.id], sort.desc);
          };
        }), sorted.map(function (d) {
          return !d.desc;
        }), this.props.indexKey);

        sortedData.forEach(function (row) {
          if (!row[_this4.props.subRowsKey]) {
            return;
          }
          row[_this4.props.subRowsKey] = _this4.sortData(row[_this4.props.subRowsKey], sorted, sortMethodsByColumnID);
        });

        return sortedData;
      }
    }, {
      key: 'getMinRows',
      value: function getMinRows() {
        return _utils2.default.getFirstDefined(this.props.minRows, this.getStateOrProp('pageSize'));
      }

      // User actions

    }, {
      key: 'onPageChange',
      value: function onPageChange(page) {
        var _props = this.props,
            onPageChange = _props.onPageChange,
            collapseOnPageChange = _props.collapseOnPageChange;


        var newState = { page: page };
        if (collapseOnPageChange) {
          newState.expanded = {};
        }
        this.setStateWithData(newState, function () {
          return onPageChange && onPageChange(page);
        });
      }
    }, {
      key: 'onPageSizeChange',
      value: function onPageSizeChange(newPageSize) {
        var onPageSizeChange = this.props.onPageSizeChange;

        var _getResolvedState = this.getResolvedState(),
            pageSize = _getResolvedState.pageSize,
            page = _getResolvedState.page;

        // Normalize the page to display


        var currentRow = pageSize * page;
        var newPage = Math.floor(currentRow / newPageSize);

        this.setStateWithData({
          pageSize: newPageSize,
          page: newPage
        }, function () {
          return onPageSizeChange && onPageSizeChange(newPageSize, newPage);
        });
      }
    }, {
      key: 'sortColumn',
      value: function sortColumn(column, additive) {
        var _getResolvedState2 = this.getResolvedState(),
            sorted = _getResolvedState2.sorted,
            skipNextSort = _getResolvedState2.skipNextSort,
            defaultSortDesc = _getResolvedState2.defaultSortDesc;

        var firstSortDirection = Object.prototype.hasOwnProperty.call(column, 'defaultSortDesc') ? column.defaultSortDesc : defaultSortDesc;
        var secondSortDirection = !firstSortDirection;

        // we can't stop event propagation from the column resize move handlers
        // attached to the document because of react's synthetic events
        // so we have to prevent the sort function from actually sorting
        // if we click on the column resize element within a header.
        if (skipNextSort) {
          this.setStateWithData({
            skipNextSort: false
          });
          return;
        }

        var onSortedChange = this.props.onSortedChange;


        var newSorted = _utils2.default.clone(sorted || []).map(function (d) {
          d.desc = _utils2.default.isSortingDesc(d);
          return d;
        });
        if (!_utils2.default.isArray(column)) {
          // Single-Sort
          var existingIndex = newSorted.findIndex(function (d) {
            return d.id === column.id;
          });
          if (existingIndex > -1) {
            var existing = newSorted[existingIndex];
            if (existing.desc === secondSortDirection) {
              if (additive) {
                newSorted.splice(existingIndex, 1);
              } else {
                existing.desc = firstSortDirection;
                newSorted = [existing];
              }
            } else {
              existing.desc = secondSortDirection;
              if (!additive) {
                newSorted = [existing];
              }
            }
          } else if (additive) {
            newSorted.push({
              id: column.id,
              desc: firstSortDirection
            });
          } else {
            newSorted = [{
              id: column.id,
              desc: firstSortDirection
            }];
          }
        } else {
          // Multi-Sort
          var _existingIndex = newSorted.findIndex(function (d) {
            return d.id === column[0].id;
          });
          // Existing Sorted Column
          if (_existingIndex > -1) {
            var _existing = newSorted[_existingIndex];
            if (_existing.desc === secondSortDirection) {
              if (additive) {
                newSorted.splice(_existingIndex, column.length);
              } else {
                column.forEach(function (d, i) {
                  newSorted[_existingIndex + i].desc = firstSortDirection;
                });
              }
            } else {
              column.forEach(function (d, i) {
                newSorted[_existingIndex + i].desc = secondSortDirection;
              });
            }
            if (!additive) {
              newSorted = newSorted.slice(_existingIndex, column.length);
            }
            // New Sort Column
          } else if (additive) {
            newSorted = newSorted.concat(column.map(function (d) {
              return {
                id: d.id,
                desc: firstSortDirection
              };
            }));
          } else {
            newSorted = column.map(function (d) {
              return {
                id: d.id,
                desc: firstSortDirection
              };
            });
          }
        }

        this.setStateWithData({
          page: !sorted.length && newSorted.length || !additive ? 0 : this.state.page,
          sorted: newSorted
        }, function () {
          return onSortedChange && onSortedChange(newSorted, column, additive);
        });
      }
    }, {
      key: 'filterColumn',
      value: function filterColumn(column, value) {
        var _getResolvedState3 = this.getResolvedState(),
            filtered = _getResolvedState3.filtered;

        var onFilteredChange = this.props.onFilteredChange;

        // Remove old filter first if it exists

        var newFiltering = (filtered || []).filter(function (x) {
          return x.id !== column.id;
        });

        if (value !== '') {
          newFiltering.push({
            id: column.id,
            value: value
          });
        }

        this.setStateWithData({
          filtered: newFiltering
        }, function () {
          return onFilteredChange && onFilteredChange(newFiltering, column, value);
        });
      }
    }, {
      key: 'resizeColumnStart',
      value: function resizeColumnStart(event, column, isTouch) {
        var _this5 = this;

        event.stopPropagation();
        var parentWidth = event.target.parentElement.getBoundingClientRect().width;

        var pageX = void 0;
        if (isTouch) {
          pageX = event.changedTouches[0].pageX;
        } else {
          pageX = event.pageX;
        }

        this.trapEvents = true;
        this.setStateWithData({
          currentlyResizing: {
            id: column.id,
            startX: pageX,
            parentWidth: parentWidth
          }
        }, function () {
          if (isTouch) {
            document.addEventListener('touchmove', _this5.resizeColumnMoving);
            document.addEventListener('touchcancel', _this5.resizeColumnEnd);
            document.addEventListener('touchend', _this5.resizeColumnEnd);
          } else {
            document.addEventListener('mousemove', _this5.resizeColumnMoving);
            document.addEventListener('mouseup', _this5.resizeColumnEnd);
            document.addEventListener('mouseleave', _this5.resizeColumnEnd);
          }
        });
      }
    }, {
      key: 'resizeColumnMoving',
      value: function resizeColumnMoving(event) {
        event.stopPropagation();
        var onResizedChange = this.props.onResizedChange;

        var _getResolvedState4 = this.getResolvedState(),
            resized = _getResolvedState4.resized,
            currentlyResizing = _getResolvedState4.currentlyResizing;

        // Delete old value


        var newResized = resized.filter(function (x) {
          return x.id !== currentlyResizing.id;
        });

        var pageX = void 0;

        if (event.type === 'touchmove') {
          pageX = event.changedTouches[0].pageX;
        } else if (event.type === 'mousemove') {
          pageX = event.pageX;
        }

        // Set the min size to 10 to account for margin and border or else the
        // group headers don't line up correctly
        var newWidth = Math.max(currentlyResizing.parentWidth + pageX - currentlyResizing.startX, 11);

        newResized.push({
          id: currentlyResizing.id,
          value: newWidth
        });

        this.setStateWithData({
          resized: newResized
        }, function () {
          return onResizedChange && onResizedChange(newResized, event);
        });
      }
    }, {
      key: 'resizeColumnEnd',
      value: function resizeColumnEnd(event) {
        event.stopPropagation();
        var isTouch = event.type === 'touchend' || event.type === 'touchcancel';

        if (isTouch) {
          document.removeEventListener('touchmove', this.resizeColumnMoving);
          document.removeEventListener('touchcancel', this.resizeColumnEnd);
          document.removeEventListener('touchend', this.resizeColumnEnd);
        }

        // If its a touch event clear the mouse one's as well because sometimes
        // the mouseDown event gets called as well, but the mouseUp event doesn't
        document.removeEventListener('mousemove', this.resizeColumnMoving);
        document.removeEventListener('mouseup', this.resizeColumnEnd);
        document.removeEventListener('mouseleave', this.resizeColumnEnd);

        // The touch events don't propagate up to the sorting's onMouseDown event so
        // no need to prevent it from happening or else the first click after a touch
        // event resize will not sort the column.
        if (!isTouch) {
          this.setStateWithData({
            skipNextSort: true,
            currentlyResizing: false
          });
        }
      }
    }]);

    return _class;
  }(Base);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZXRob2RzLmpzIl0sIm5hbWVzIjpbInByb3BzIiwic3RhdGUiLCJyZXNvbHZlZFN0YXRlIiwiXyIsImNvbXBhY3RPYmplY3QiLCJuZXdTdGF0ZSIsImRhdGFDaGFuZ2VkIiwiY29sdW1ucyIsInBpdm90QnkiLCJkYXRhIiwicmVzb2x2ZURhdGEiLCJwaXZvdElES2V5IiwicGl2b3RWYWxLZXkiLCJzdWJSb3dzS2V5IiwiYWdncmVnYXRlZEtleSIsIm5lc3RpbmdMZXZlbEtleSIsIm9yaWdpbmFsS2V5IiwiaW5kZXhLZXkiLCJncm91cGVkQnlQaXZvdEtleSIsIlN1YkNvbXBvbmVudCIsImhhc0hlYWRlckdyb3VwcyIsInNvbWUiLCJjb2x1bW4iLCJhbGxDb2x1bW5zIiwiaXRlclRyZWUiLCJleHBhbmRlckNvbHVtbiIsImdldEZpcnN0RGVmaW5lZCIsImhhc1N1YkNvbXBvbmVudEFuZE5vRXhwYW5kZXJDb2x1bW4iLCJjb2x1bW5zV2l0aEV4cGFuZGVyIiwiZXhwYW5kZXIiLCJtYWtlRGVjb3JhdGVkQ29sdW1uIiwicGFyZW50Q29sdW1uIiwiZGNvbCIsImV4cGFuZGVyRGVmYXVsdHMiLCJtYXhXaWR0aCIsIm1pbldpZHRoIiwiYWNjZXNzb3IiLCJpZCIsImFjY2Vzc29yU3RyaW5nIiwiZ2V0Iiwicm93IiwiY29uc29sZSIsIndhcm4iLCJFcnJvciIsInVuZGVmaW5lZCIsImFsbERlY29yYXRlZENvbHVtbnMiLCJkZWNvcmF0ZUFuZEFkZFRvQWxsIiwibWFwIiwiZGVjb3JhdGVkQ29sdW1uIiwicHVzaCIsImRlY29yYXRlZENvbHVtbnMiLCJtYXBWaXNpYmxlQ29sdW1ucyIsInZpc2libGVTdWJDb2x1bW5zIiwiZmlsdGVyIiwiaW5kZXhPZiIsImQiLCJzaG93IiwiZmlsdGVyVmlzaWJsZUNvbHVtbnMiLCJsZW5ndGgiLCJhbGxWaXNpYmxlQ29sdW1ucyIsInNsaWNlIiwicGl2b3RJbmRleCIsImZpbmRJbmRleCIsImNvbCIsInBpdm90IiwicGl2b3RDb2x1bW5zIiwiZm9yRWFjaCIsImZvdW5kIiwiZmluZCIsInBpdm90SUQiLCJQaXZvdFBhcmVudENvbHVtbiIsInJlZHVjZSIsInByZXYiLCJjdXJyZW50IiwiUGl2b3RHcm91cEhlYWRlciIsIkhlYWRlciIsInBpdm90Q29sdW1uR3JvdXAiLCJwaXZvdERlZmF1bHRzIiwicGl2b3RlZCIsInNwbGljZSIsInVuc2hpZnQiLCJnZXREZWVwZXN0QnJhbmNoIiwic3ViQnJhbmNoZXMiLCJkZWVwZXN0QnJhbmNoIiwiYnJhbmNoIiwiY29uY2F0IiwiY29sdW1uRGVwdGhzIiwibWF4RGVwdGgiLCJNYXRoIiwibWF4IiwibGFzdENvbHVtbiIsImxhc3QiLCJsYXN0Q29sdW1uRGVwdGgiLCJpIiwiYWxsQ29sdW1uSGVhZGVycyIsImFkZEhlYWRlciIsImxldmVsIiwiY2hpbGRMZXZlbHMiLCJsb3dlckxldmVsIiwicHJlY2VkaW5nQ29sdW1uIiwiaW5kZXhPZkZpcnN0Q2hpbGRJbkxvd2VyTGV2ZWwiLCJpbmRleEFmdGVyTGFzdENoaWxkSW5QcmVjZWRpbmdDb2x1bW4iLCJvcnBoYW5zIiwidmlzaWJsZUNvbHVtbnMiLCJzaGlmdCIsImhlYWRlckdyb3VwcyIsInJldmVyc2UiLCJhY2Nlc3NSb3ciLCJyZXNvbHZlZERhdGEiLCJhZ2dyZWdhdGluZ0NvbHVtbnMiLCJhZ2dyZWdhdGUiLCJhZ2dyZWdhdGlvblZhbHVlcyIsInZhbHVlcyIsInJvd3MiLCJncm91cFJlY3Vyc2l2ZWx5Iiwia2V5cyIsImdyb3VwZWRSb3dzIiwiT2JqZWN0IiwiZW50cmllcyIsImdyb3VwQnkiLCJrZXkiLCJ2YWx1ZSIsInN1YlJvd3MiLCJyb3dHcm91cCIsIm1hbnVhbCIsInNvcnRlZCIsImZpbHRlcmVkIiwiZGVmYXVsdEZpbHRlck1ldGhvZCIsInNvcnRNZXRob2RzQnlDb2x1bW5JRCIsInNvcnRNZXRob2QiLCJzb3J0ZWREYXRhIiwic29ydERhdGEiLCJmaWx0ZXJEYXRhIiwib25GZXRjaERhdGEiLCJnZXRSZXNvbHZlZFN0YXRlIiwiZmlsdGVyZWREYXRhIiwiZmlsdGVyZWRTb0ZhciIsIm5leHRGaWx0ZXIiLCJ4IiwiZmlsdGVyYWJsZSIsImZpbHRlck1ldGhvZCIsImZpbHRlckFsbCIsIm9yZGVyQnlNZXRob2QiLCJvcmRlckJ5Iiwic29ydCIsImEiLCJiIiwiZGVzYyIsImRlZmF1bHRTb3J0TWV0aG9kIiwibWluUm93cyIsImdldFN0YXRlT3JQcm9wIiwicGFnZSIsIm9uUGFnZUNoYW5nZSIsImNvbGxhcHNlT25QYWdlQ2hhbmdlIiwiZXhwYW5kZWQiLCJzZXRTdGF0ZVdpdGhEYXRhIiwibmV3UGFnZVNpemUiLCJvblBhZ2VTaXplQ2hhbmdlIiwicGFnZVNpemUiLCJjdXJyZW50Um93IiwibmV3UGFnZSIsImZsb29yIiwiYWRkaXRpdmUiLCJza2lwTmV4dFNvcnQiLCJkZWZhdWx0U29ydERlc2MiLCJmaXJzdFNvcnREaXJlY3Rpb24iLCJwcm90b3R5cGUiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJzZWNvbmRTb3J0RGlyZWN0aW9uIiwib25Tb3J0ZWRDaGFuZ2UiLCJuZXdTb3J0ZWQiLCJjbG9uZSIsImlzU29ydGluZ0Rlc2MiLCJpc0FycmF5IiwiZXhpc3RpbmdJbmRleCIsImV4aXN0aW5nIiwib25GaWx0ZXJlZENoYW5nZSIsIm5ld0ZpbHRlcmluZyIsImV2ZW50IiwiaXNUb3VjaCIsInN0b3BQcm9wYWdhdGlvbiIsInBhcmVudFdpZHRoIiwidGFyZ2V0IiwicGFyZW50RWxlbWVudCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIndpZHRoIiwicGFnZVgiLCJjaGFuZ2VkVG91Y2hlcyIsInRyYXBFdmVudHMiLCJjdXJyZW50bHlSZXNpemluZyIsInN0YXJ0WCIsImRvY3VtZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlc2l6ZUNvbHVtbk1vdmluZyIsInJlc2l6ZUNvbHVtbkVuZCIsIm9uUmVzaXplZENoYW5nZSIsInJlc2l6ZWQiLCJuZXdSZXNpemVkIiwidHlwZSIsIm5ld1dpZHRoIiwicmVtb3ZlRXZl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ZUFBaEQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBSSxDQUFDZixPQUFMLEVBQWM7QUFDWixlQUFLekIsZ0JBQUwsQ0FBc0I7QUFDcEJRLDBCQUFjLElBRE07QUFFcEIyQiwrQkFBbUI7QUFGQyxXQUF0QjtBQUlEO0FBQ0Y7QUF0c0JVOztBQUFBO0FBQUEsSUFDQ1ksSUFERDtBQUFBLEMiLCJmaWxlIjoibWV0aG9kcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBfIGZyb20gJy4vdXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IEJhc2UgPT5cbiAgY2xhc3MgZXh0ZW5kcyBCYXNlIHtcbiAgICBnZXRSZXNvbHZlZFN0YXRlIChwcm9wcywgc3RhdGUpIHtcbiAgICAgIGNvbnN0IHJlc29sdmVkU3RhdGUgPSB7XG4gICAgICAgIC4uLl8uY29tcGFjdE9iamVjdCh0aGlzLnN0YXRlKSxcbiAgICAgICAgLi4uXy5jb21wYWN0T2JqZWN0KHRoaXMucHJvcHMpLFxuICAgICAgICAuLi5fLmNvbXBhY3RPYmplY3Qoc3RhdGUpLFxuICAgICAgICAuLi5fLmNvbXBhY3RPYmplY3QocHJvcHMpLFxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmVkU3RhdGVcbiAgICB9XG5cbiAgICBnZXREYXRhTW9kZWwgKG5ld1N0YXRlLCBkYXRhQ2hhbmdlZCkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBjb2x1bW5zLFxuICAgICAgICBwaXZvdEJ5ID0gW10sXG4gICAgICAgIGRhdGEsXG4gICAgICAgIHJlc29sdmVEYXRhLFxuICAgICAgICBwaXZvdElES2V5LFxuICAgICAgICBwaXZvdFZhbEtleSxcbiAgICAgICAgc3ViUm93c0tleSxcbiAgICAgICAgYWdncmVnYXRlZEtleSxcbiAgICAgICAgbmVzdGluZ0xldmVsS2V5LFxuICAgICAgICBvcmlnaW5hbEtleSxcbiAgICAgICAgaW5kZXhLZXksXG4gICAgICAgIGdyb3VwZWRCeVBpdm90S2V5LFxuICAgICAgICBTdWJDb21wb25lbnQsXG4gICAgICB9ID0gbmV3U3RhdGVcblxuICAgICAgLy8gRGV0ZXJtaW5lIGlmIHRoZXJlIGFyZSBIZWFkZXIgR3JvdXBzXG4gICAgICBjb25zdCBoYXNIZWFkZXJHcm91cHMgPSBjb2x1bW5zLnNvbWUoY29sdW1uID0+IGNvbHVtbi5jb2x1bW5zKVxuXG4gICAgICAvLyBGaW5kIHRoZSBleHBhbmRlciBjb2x1bW4gd2hpY2ggY291bGQgYmUgZGVlcCBpbiB0cmVlIG9mIGNvbHVtbnNcbiAgICAgIGNvbnN0IGFsbENvbHVtbnMgPSBfLml0ZXJUcmVlKGNvbHVtbnMsICdjb2x1bW5zJylcbiAgICAgIGNvbnN0IGV4cGFuZGVyQ29sdW1uID0gXy5nZXRGaXJzdERlZmluZWQoYWxsQ29sdW1ucylcblxuICAgICAgLy8gSWYgd2UgaGF2ZSBTdWJDb21wb25lbnQncyB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSB3ZSBoYXZlIGFuIGV4cGFuZGVyIGNvbHVtblxuICAgICAgY29uc3QgaGFzU3ViQ29tcG9uZW50QW5kTm9FeHBhbmRlckNvbHVtbiA9IFN1YkNvbXBvbmVudCAmJiAhZXhwYW5kZXJDb2x1bW5cbiAgICAgIGNvbnN0IGNvbHVtbnNXaXRoRXhwYW5kZXIgPSBoYXNTdWJDb21wb25lbnRBbmROb0V4cGFuZGVyQ29sdW1uXG4gICAgICAgID8gW3sgZXhwYW5kZXI6IHRydWUgfSwgLi4uY29sdW1uc11cbiAgICAgICAgOiBbLi4uY29sdW1uc11cblxuICAgICAgY29uc3QgbWFrZURlY29yYXRlZENvbHVtbiA9IChjb2x1bW4sIHBhcmVudENvbHVtbikgPT4ge1xuICAgICAgICBsZXQgZGNvbFxuICAgICAgICBpZiAoY29sdW1uLmV4cGFuZGVyKSB7XG4gICAgICAgICAgZGNvbCA9IHtcbiAgICAgICAgICAgIC4uLnRoaXMucHJvcHMuY29sdW1uLFxuICAgICAgICAgICAgLi4udGhpcy5wcm9wcy5leHBhbmRlckRlZmF1bHRzLFxuICAgICAgICAgICAgLi4uY29sdW1uLFxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkY29sID0ge1xuICAgICAgICAgICAgLi4udGhpcy5wcm9wcy5jb2x1bW4sXG4gICAgICAgICAgICAuLi50aGlzLnByb3BzLmNvbHVtbixcbiAgICAgICAgICAgIC4uLmNvbHVtbixcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbnN1cmUgbWluV2lkdGggaXMgbm90IGdyZWF0ZXIgdGhhbiBtYXhXaWR0aCBpZiBzZXRcbiAgICAgICAgaWYgKGRjb2wubWF4V2lkdGggPCBkY29sLm1pbldpZHRoKSB7XG4gICAgICAgICAgZGNvbC5taW5XaWR0aCA9IGRjb2wubWF4V2lkdGhcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJlbnRDb2x1bW4pIHtcbiAgICAgICAgICBkY29sLnBhcmVudENvbHVtbiA9IHBhcmVudENvbHVtblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlyc3QgY2hlY2sgZm9yIHN0cmluZyBhY2Nlc3NvclxuICAgICAgICBpZiAodHlwZW9mIGRjb2wuYWNjZXNzb3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgZGNvbC5pZCA9IGRjb2wuaWQgfHwgZGNvbC5hY2Nlc3NvclxuICAgICAgICAgIGNvbnN0IGFjY2Vzc29yU3RyaW5nID0gZGNvbC5hY2Nlc3NvclxuICAgICAgICAgIGRjb2wuYWNjZXNzb3IgPSByb3cgPT4gXy5nZXQocm93LCBhY2Nlc3NvclN0cmluZylcbiAgICAgICAgICByZXR1cm4gZGNvbFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmFsbCBiYWNrIHRvIGZ1bmN0aW9uYWwgYWNjZXNzb3IgKGJ1dCByZXF1aXJlIGFuIElEKVxuICAgICAgICBpZiAoZGNvbC5hY2Nlc3NvciAmJiAhZGNvbC5pZCkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihkY29sKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdBIGNvbHVtbiBpZCBpcyByZXF1aXJlZCBpZiB1c2luZyBhIG5vbi1zdHJpbmcgYWNjZXNzb3IgZm9yIGNvbHVtbiBhYm92ZS4nXG4gICAgICAgICAgKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmFsbCBiYWNrIHRvIGFuIHVuZGVmaW5lZCBhY2Nlc3NvclxuICAgICAgICBpZiAoIWRjb2wuYWNjZXNzb3IpIHtcbiAgICAgICAgICBkY29sLmFjY2Vzc29yID0gKCkgPT4gdW5kZWZpbmVkXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGNvbFxuICAgICAgfVxuXG4gICAgICBjb25zdCBhbGxEZWNvcmF0ZWRDb2x1bW5zID0gW11cblxuICAgICAgLy8gRGVjb3JhdGUgdGhlIGNvbHVtbnNcbiAgICAgIGNvbnN0IGRlY29yYXRlQW5kQWRkVG9BbGwgPSAoY29sdW1ucywgcGFyZW50Q29sdW1uKSA9PiBjb2x1bW5zLm1hcChjb2x1bW4gPT4ge1xuICAgICAgICBjb25zdCBkZWNvcmF0ZWRDb2x1bW4gPSBtYWtlRGVjb3JhdGVkQ29sdW1uKGNvbHVtbiwgcGFyZW50Q29sdW1uKVxuICAgICAgICBpZiAoY29sdW1uLmNvbHVtbnMpIHtcbiAgICAgICAgICBkZWNvcmF0ZWRDb2x1bW4uY29sdW1ucyA9IGRlY29yYXRlQW5kQWRkVG9BbGwoY29sdW1uLmNvbHVtbnMsIGNvbHVtbilcbiAgICAgICAgfVxuXG4gICAgICAgIGFsbERlY29yYXRlZENvbHVtbnMucHVzaChkZWNvcmF0ZWRDb2x1bW4pXG4gICAgICAgIHJldHVybiBkZWNvcmF0ZWRDb2x1bW5cbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGRlY29yYXRlZENvbHVtbnMgPSBkZWNvcmF0ZUFuZEFkZFRvQWxsKGNvbHVtbnNXaXRoRXhwYW5kZXIpXG4gICAgICBjb25zdCBtYXBWaXNpYmxlQ29sdW1ucyA9IGNvbHVtbnMgPT4gY29sdW1ucy5tYXAoY29sdW1uID0+IHtcbiAgICAgICAgaWYgKGNvbHVtbi5jb2x1bW5zKSB7XG4gICAgICAgICAgY29uc3QgdmlzaWJsZVN1YkNvbHVtbnMgPSBjb2x1bW4uY29sdW1ucy5maWx0ZXIoXG4gICAgICAgICAgICBkID0+IChwaXZvdEJ5LmluZGV4T2YoZC5pZCkgPiAtMSA/IGZhbHNlIDogXy5nZXRGaXJzdERlZmluZWQoZC5zaG93LCB0cnVlKSlcbiAgICAgICAgICApXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLmNvbHVtbixcbiAgICAgICAgICAgIGNvbHVtbnM6IG1hcFZpc2libGVDb2x1bW5zKHZpc2libGVTdWJDb2x1bW5zKSxcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbHVtblxuICAgICAgfSlcblxuICAgICAgY29uc3QgZmlsdGVyVmlzaWJsZUNvbHVtbnMgPSBjb2x1bW5zID0+IGNvbHVtbnMuZmlsdGVyKFxuICAgICAgICBjb2x1bW4gPT5cbiAgICAgICAgICBjb2x1bW4uY29sdW1uc1xuICAgICAgICAgICAgPyBjb2x1bW4uY29sdW1ucy5sZW5ndGhcbiAgICAgICAgICAgIDogcGl2b3RCeS5pbmRleE9mKGNvbHVtbi5pZCkgPiAtMVxuICAgICAgICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICAgIDogXy5nZXRGaXJzdERlZmluZWQoY29sdW1uLnNob3csIHRydWUpXG4gICAgICApXG5cbiAgICAgIC8vIEJ1aWxkIHRoZSBmdWxsIGFycmF5IG9mIHZpc2libGUgY29sdW1ucyAtIHRoaXMgaXMgYW4gYXJyYXkgdGhhdCBjb250YWlucyBhbGwgY29sdW1ucyB0aGF0XG4gICAgICAvLyBhcmUgbm90IGhpZGRlbiB2aWEgcGl2b3RpbmdcbiAgICAgIGNvbnN0IGFsbFZpc2libGVDb2x1bW5zID0gZmlsdGVyVmlzaWJsZUNvbHVtbnMobWFwVmlzaWJsZUNvbHVtbnMoZGVjb3JhdGVkQ29sdW1ucy5zbGljZSgpKSlcblxuICAgICAgLy8gRmluZCBhbnkgY3VzdG9tIHBpdm90IGxvY2F0aW9uXG4gICAgICBjb25zdCBwaXZvdEluZGV4ID0gYWxsVmlzaWJsZUNvbHVtbnMuZmluZEluZGV4KGNvbCA9PiBjb2wucGl2b3QpXG5cbiAgICAgIC8vIEhhbmRsZSBQaXZvdCBDb2x1bW5zXG4gICAgICBpZiAocGl2b3RCeS5sZW5ndGgpIHtcbiAgICAgICAgLy8gUmV0cmlldmUgdGhlIHBpdm90IGNvbHVtbnMgaW4gdGhlIGNvcnJlY3QgcGl2b3Qgb3JkZXJcbiAgICAgICAgY29uc3QgcGl2b3RDb2x1bW5zID0gW11cbiAgICAgICAgcGl2b3RCeS5mb3JFYWNoKHBpdm90SUQgPT4ge1xuICAgICAgICAgIGNvbnN0IGZvdW5kID0gYWxsRGVjb3JhdGVkQ29sdW1ucy5maW5kKGQgPT4gZC5pZCA9PT0gcGl2b3RJRClcbiAgICAgICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgICAgIHBpdm90Q29sdW1ucy5wdXNoKGZvdW5kKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICBjb25zdCBQaXZvdFBhcmVudENvbHVtbiA9IHBpdm90Q29sdW1ucy5yZWR1Y2UoXG4gICAgICAgICAgKHByZXYsIGN1cnJlbnQpID0+IHByZXYgJiYgcHJldiA9PT0gY3VycmVudC5wYXJlbnRDb2x1bW4gJiYgY3VycmVudC5wYXJlbnRDb2x1bW4sXG4gICAgICAgICAgcGl2b3RDb2x1bW5zWzBdLnBhcmVudENvbHVtblxuICAgICAgICApXG5cbiAgICAgICAgbGV0IFBpdm90R3JvdXBIZWFkZXIgPSBoYXNIZWFkZXJHcm91cHMgJiYgUGl2b3RQYXJlbnRDb2x1bW4uSGVhZGVyXG4gICAgICAgIFBpdm90R3JvdXBIZWFkZXIgPSBQaXZvdEdyb3VwSGVhZGVyIHx8ICgoKSA9PiA8c3Ryb25nPlBpdm90ZWQ8L3N0cm9uZz4pXG5cbiAgICAgICAgbGV0IHBpdm90Q29sdW1uR3JvdXAgPSB7XG4gICAgICAgICAgSGVhZGVyOiBQaXZvdEdyb3VwSGVhZGVyLFxuICAgICAgICAgIGNvbHVtbnM6IHBpdm90Q29sdW1ucy5tYXAoY29sID0+ICh7XG4gICAgICAgICAgICAuLi50aGlzLnByb3BzLnBpdm90RGVmYXVsdHMsXG4gICAgICAgICAgICAuLi5jb2wsXG4gICAgICAgICAgICBwaXZvdGVkOiB0cnVlLFxuICAgICAgICAgIH0pKSxcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBsYWNlIHRoZSBwaXZvdENvbHVtbnMgYmFjayBpbnRvIHRoZSB2aXNpYmxlQ29sdW1uc1xuICAgICAgICBpZiAocGl2b3RJbmRleCA+PSAwKSB7XG4gICAgICAgICAgcGl2b3RDb2x1bW5Hcm91cCA9IHtcbiAgICAgICAgICAgIC4uLmFsbFZpc2libGVDb2x1bW5zW3Bpdm90SW5kZXhdLFxuICAgICAgICAgICAgLi4ucGl2b3RDb2x1bW5Hcm91cCxcbiAgICAgICAgICB9XG4gICAgICAgICAgYWxsVmlzaWJsZUNvbHVtbnMuc3BsaWNlKHBpdm90SW5kZXgsIDEsIHBpdm90Q29sdW1uR3JvdXApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWxsVmlzaWJsZUNvbHVtbnMudW5zaGlmdChwaXZvdENvbHVtbkdyb3VwKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIERldGVybWluZSBtYXhpbXVtIGNvbHVtbiBkZXB0aFxuICAgICAgY29uc3QgZ2V0RGVlcGVzdEJyYW5jaCA9IGNvbHVtbiA9PiB7XG4gICAgICAgIGlmIChjb2x1bW4uY29sdW1ucykge1xuICAgICAgICAgIGNvbnN0IHN1YkJyYW5jaGVzID0gY29sdW1uLmNvbHVtbnMubWFwKGdldERlZXBlc3RCcmFuY2gpXG4gICAgICAgICAgbGV0IGRlZXBlc3RCcmFuY2hcbiAgICAgICAgICBzdWJCcmFuY2hlcy5mb3JFYWNoKGJyYW5jaCA9PiB7XG4gICAgICAgICAgICBpZiAoIWRlZXBlc3RCcmFuY2ggfHwgZGVlcGVzdEJyYW5jaC5sZW5ndGggPCBicmFuY2gubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGRlZXBlc3RCcmFuY2ggPSBicmFuY2hcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVybiBbY29sdW1uXS5jb25jYXQoZGVlcGVzdEJyYW5jaClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW2NvbHVtbl1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvbHVtbkRlcHRocyA9IGFsbFZpc2libGVDb2x1bW5zXG4gICAgICAgIC5tYXAoZ2V0RGVlcGVzdEJyYW5jaClcbiAgICAgICAgLm1hcChicmFuY2ggPT4gYnJhbmNoLmxlbmd0aClcbiAgICAgIGNvbnN0IG1heERlcHRoID0gTWF0aC5tYXgoLi4uY29sdW1uRGVwdGhzKVxuXG4gICAgICAvLyBQYWQgbGFzdCBjb2x1bW4gdXAgdG8gbWF4aW11bSBkZXB0aFxuICAgICAgY29uc3QgbGFzdENvbHVtbiA9IF8ubGFzdChhbGxWaXNpYmxlQ29sdW1ucylcbiAgICAgIGNvbnN0IGxhc3RDb2x1bW5EZXB0aCA9IGdldERlZXBlc3RCcmFuY2gobGFzdENvbHVtbikubGVuZ3RoXG4gICAgICBpZiAobGFzdENvbHVtbkRlcHRoIDwgbWF4RGVwdGgpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtYXhEZXB0aCAtIGxhc3RDb2x1bW5EZXB0aDsgaSsrKSB7XG4gICAgICAgICAgYWxsVmlzaWJsZUNvbHVtbnNbYWxsVmlzaWJsZUNvbHVtbnMubGVuZ3RoIC0gMV0gPSB7XG4gICAgICAgICAgICAuLi50aGlzLnByb3BzLmNvbHVtbixcbiAgICAgICAgICAgIGNvbHVtbnM6IFtfLmxhc3QoYWxsVmlzaWJsZUNvbHVtbnMpXSxcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQnVpbGQgVmlzaWJsZSBDb2x1bW5zIGFuZCBIZWFkZXIgR3JvdXBzXG4gICAgICBjb25zdCBhbGxDb2x1bW5IZWFkZXJzID0gW11cblxuICAgICAgY29uc3QgYWRkSGVhZGVyID0gY29sdW1uID0+IHtcbiAgICAgICAgbGV0IGxldmVsID0gMFxuXG4gICAgICAgIC8vIElmIHRoaXMgY29sdW1uIGhhcyBjaGlsZHJlbiwgcHVzaCB0aGVtIGZpcnN0IGFuZCBhZGQgdGhpcyBjb2x1bW4gdG8gdGhlIG5leHQgbGV2ZWxcbiAgICAgICAgaWYgKGNvbHVtbi5jb2x1bW5zKSB7XG4gICAgICAgICAgY29uc3QgY2hpbGRMZXZlbHMgPSBjb2x1bW4uY29sdW1ucy5tYXAoYWRkSGVhZGVyKVxuICAgICAgICAgIGxldmVsID0gTWF0aC5tYXgoLi4uY2hpbGRMZXZlbHMpICsgMVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHNwYW5zIGFib3ZlIGNvbHVtbnMgd2l0aG91dCBwYXJlbnRzIChvcnBoYW5zKSB0byBmaWxsIHRoZSBzcGFjZSBhYm92ZSB0aGVtXG4gICAgICAgIGlmIChhbGxDb2x1bW5IZWFkZXJzLmxlbmd0aCA8PSBsZXZlbCkgYWxsQ29sdW1uSGVhZGVycy5wdXNoKFtdKVxuICAgICAgICBpZiAobGV2ZWwgPiAwKSB7XG4gICAgICAgICAgLy8gVGhlIHNwYW5zIG5lZWQgdG8gY29udGFpbiB0aGUgc2hpZnRlZCBoZWFkZXJzIGFzIGNoaWxkcmVuLiBUaGlzIGZpbmRzIGFsbCBvZiB0aGVcbiAgICAgICAgICAvLyBjb2x1bW5zIGluIHRoZSBsb3dlciBsZXZlbCBiZXR3ZWVuIHRoZSBmaXJzdCBjaGlsZCBvZiB0aGlzIGNvbHVtbiBhbmQgdGhlIGxhc3QgY2hpbGRcbiAgICAgICAgICAvLyBvZiB0aGUgcHJlY2VkaW5nIGNvbHVtbiAoaWYgdGhlcmUgaXMgb25lKVxuICAgICAgICAgIGNvbnN0IGxvd2VyTGV2ZWwgPSBhbGxDb2x1bW5IZWFkZXJzW2xldmVsIC0gMV1cbiAgICAgICAgICBjb25zdCBwcmVjZWRpbmdDb2x1bW4gPSBfLmxhc3QoYWxsQ29sdW1uSGVhZGVyc1tsZXZlbF0pXG5cbiAgICAgICAgICBjb25zdCBpbmRleE9mRmlyc3RDaGlsZEluTG93ZXJMZXZlbCA9IGxvd2VyTGV2ZWwuaW5kZXhPZihjb2x1bW4uY29sdW1uc1swXSlcbiAgICAgICAgICBjb25zdCBpbmRleEFmdGVyTGFzdENoaWxkSW5QcmVjZWRpbmdDb2x1bW4gPSBwcmVjZWRpbmdDb2x1bW5cbiAgICAgICAgICAgID8gbG93ZXJMZXZlbC5pbmRleE9mKF8ubGFzdChwcmVjZWRpbmdDb2x1bW4uY29sdW1ucykpICsgMVxuICAgICAgICAgICAgOiAwXG5cbiAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgb3BoYW5zLCBhZGQgYSBzcGFuIGFib3ZlIHRoZW1cbiAgICAgICAgICBjb25zdCBvcnBoYW5zID0gbG93ZXJMZXZlbC5zbGljZShcbiAgICAgICAgICAgIGluZGV4QWZ0ZXJMYXN0Q2hpbGRJblByZWNlZGluZ0NvbHVtbixcbiAgICAgICAgICAgIGluZGV4T2ZGaXJzdENoaWxkSW5Mb3dlckxldmVsXG4gICAgICAgICAgKVxuXG4gICAgICAgICAgaWYgKG9ycGhhbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBhbGxDb2x1bW5IZWFkZXJzW2xldmVsXS5wdXNoKHtcbiAgICAgICAgICAgICAgLi4udGhpcy5wcm9wcy5jb2x1bW4sXG4gICAgICAgICAgICAgIGNvbHVtbnM6IG9ycGhhbnMsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGFsbENvbHVtbkhlYWRlcnNbbGV2ZWxdLnB1c2goY29sdW1uKVxuXG4gICAgICAgIHJldHVybiBsZXZlbFxuICAgICAgfVxuXG4gICAgICBhbGxWaXNpYmxlQ29sdW1ucy5mb3JFYWNoKGFkZEhlYWRlcilcblxuICAgICAgLy8gdmlzaWJsZUNvbHVtbnMgaXMgYW4gYXJyYXkgY29udGFpbmluZyBjb2x1bW4gZGVmaW5pdGlvbnMgZm9yIHRoZSBib3R0b20gcm93IG9mIFRIIGVsZW1lbnRzXG4gICAgICBjb25zdCB2aXNpYmxlQ29sdW1ucyA9IGFsbENvbHVtbkhlYWRlcnMuc2hpZnQoKVxuICAgICAgY29uc3QgaGVhZGVyR3JvdXBzID0gYWxsQ29sdW1uSGVhZGVycy5yZXZlcnNlKClcblxuICAgICAgLy8gQWNjZXNzIHRoZSBkYXRhXG4gICAgICBjb25zdCBhY2Nlc3NSb3cgPSAoZCwgaSwgbGV2ZWwgPSAwKSA9PiB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHtcbiAgICAgICAgICBbb3JpZ2luYWxLZXldOiBkLFxuICAgICAgICAgIFtpbmRleEtleV06IGksXG4gICAgICAgICAgW3N1YlJvd3NLZXldOiBkW3N1YlJvd3NLZXldLFxuICAgICAgICAgIFtuZXN0aW5nTGV2ZWxLZXldOiBsZXZlbCxcbiAgICAgICAgfVxuICAgICAgICBhbGxEZWNvcmF0ZWRDb2x1bW5zLmZvckVhY2goY29sdW1uID0+IHtcbiAgICAgICAgICBpZiAoY29sdW1uLmV4cGFuZGVyKSByZXR1cm5cbiAgICAgICAgICByb3dbY29sdW1uLmlkXSA9IGNvbHVtbi5hY2Nlc3NvcihkKVxuICAgICAgICB9KVxuICAgICAgICBpZiAocm93W3N1YlJvd3NLZXldKSB7XG4gICAgICAgICAgcm93W3N1YlJvd3NLZXldID0gcm93W3N1YlJvd3NLZXldLm1hcCgoZCwgaSkgPT4gYWNjZXNzUm93KGQsIGksIGxldmVsICsgMSkpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJvd1xuICAgICAgfVxuXG4gICAgICAvLyAvLyBJZiB0aGUgZGF0YSBoYXNuJ3QgY2hhbmdlZCwganVzdCB1c2UgdGhlIGNhY2hlZCBkYXRhXG4gICAgICBsZXQgcmVzb2x2ZWREYXRhID0gdGhpcy5yZXNvbHZlZERhdGFcbiAgICAgIC8vIElmIHRoZSBkYXRhIGhhcyBjaGFuZ2VkLCBydW4gdGhlIGRhdGEgcmVzb2x2ZXIgYW5kIGNhY2hlIHRoZSByZXN1bHRcbiAgICAgIGlmICghdGhpcy5yZXNvbHZlZERhdGEgfHwgZGF0YUNoYW5nZWQpIHtcbiAgICAgICAgcmVzb2x2ZWREYXRhID0gcmVzb2x2ZURhdGEoZGF0YSlcbiAgICAgICAgdGhpcy5yZXNvbHZlZERhdGEgPSByZXNvbHZlZERhdGFcbiAgICAgIH1cbiAgICAgIC8vIFVzZSB0aGUgcmVzb2x2ZWQgZGF0YVxuICAgICAgcmVzb2x2ZWREYXRhID0gcmVzb2x2ZWREYXRhLm1hcCgoZCwgaSkgPT4gYWNjZXNzUm93KGQsIGkpKVxuXG4gICAgICAvLyBUT0RPOiBNYWtlIGl0IHBvc3NpYmxlIHRvIGZhYnJpY2F0ZSBuZXN0ZWQgcm93cyB3aXRob3V0IHBpdm90aW5nXG4gICAgICBjb25zdCBhZ2dyZWdhdGluZ0NvbHVtbnMgPSB2aXNpYmxlQ29sdW1ucy5maWx0ZXIoZCA9PiAhZC5leHBhbmRlciAmJiBkLmFnZ3JlZ2F0ZSlcblxuICAgICAgLy8gSWYgcGl2b3RpbmcsIHJlY3Vyc2l2ZWx5IGdyb3VwIHRoZSBkYXRhXG4gICAgICBjb25zdCBhZ2dyZWdhdGUgPSByb3dzID0+IHtcbiAgICAgICAgY29uc3QgYWdncmVnYXRpb25WYWx1ZXMgPSB7fVxuICAgICAgICBhZ2dyZWdhdGluZ0NvbHVtbnMuZm9yRWFjaChjb2x1bW4gPT4ge1xuICAgICAgICAgIGNvbnN0IHZhbHVlcyA9IHJvd3MubWFwKGQgPT4gZFtjb2x1bW4uaWRdKVxuICAgICAgICAgIGFnZ3JlZ2F0aW9uVmFsdWVzW2NvbHVtbi5pZF0gPSBjb2x1bW4uYWdncmVnYXRlKHZhbHVlcywgcm93cylcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIGFnZ3JlZ2F0aW9uVmFsdWVzXG4gICAgICB9XG4gICAgICBpZiAocGl2b3RCeS5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgZ3JvdXBSZWN1cnNpdmVseSA9IChyb3dzLCBrZXlzLCBpID0gMCkgPT4ge1xuICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGxhc3QgbGV2ZWwsIGp1c3QgcmV0dXJuIHRoZSByb3dzXG4gICAgICAgICAgaWYgKGkgPT09IGtleXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gcm93c1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBHcm91cCB0aGUgcm93cyB0b2dldGhlciBmb3IgdGhpcyBsZXZlbFxuICAgICAgICAgIGxldCBncm91cGVkUm93cyA9IE9iamVjdC5lbnRyaWVzKF8uZ3JvdXBCeShyb3dzLCBrZXlzW2ldKSkubWFwKChba2V5LCB2YWx1ZV0pID0+ICh7XG4gICAgICAgICAgICBbcGl2b3RJREtleV06IGtleXNbaV0sXG4gICAgICAgICAgICBbcGl2b3RWYWxLZXldOiBrZXksXG4gICAgICAgICAgICBba2V5c1tpXV06IGtleSxcbiAgICAgICAgICAgIFtzdWJSb3dzS2V5XTogdmFsdWUsXG4gICAgICAgICAgICBbbmVzdGluZ0xldmVsS2V5XTogaSxcbiAgICAgICAgICAgIFtncm91cGVkQnlQaXZvdEtleV06IHRydWUsXG4gICAgICAgICAgfSkpXG4gICAgICAgICAgLy8gUmVjdXJzZSBpbnRvIHRoZSBzdWJSb3dzXG4gICAgICAgICAgZ3JvdXBlZFJvd3MgPSBncm91cGVkUm93cy5tYXAocm93R3JvdXAgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3ViUm93cyA9IGdyb3VwUmVjdXJzaXZlbHkocm93R3JvdXBbc3ViUm93c0tleV0sIGtleXMsIGkgKyAxKVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgLi4ucm93R3JvdXAsXG4gICAgICAgICAgICAgIFtzdWJSb3dzS2V5XTogc3ViUm93cyxcbiAgICAgICAgICAgICAgW2FnZ3JlZ2F0ZWRLZXldOiB0cnVlLFxuICAgICAgICAgICAgICAuLi5hZ2dyZWdhdGUoc3ViUm93cyksXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm4gZ3JvdXBlZFJvd3NcbiAgICAgICAgfVxuICAgICAgICByZXNvbHZlZERhdGEgPSBncm91cFJlY3Vyc2l2ZWx5KHJlc29sdmVkRGF0YSwgcGl2b3RCeSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4ubmV3U3RhdGUsXG4gICAgICAgIHJlc29sdmVkRGF0YSxcbiAgICAgICAgdmlzaWJsZUNvbHVtbnMsXG4gICAgICAgIGhlYWRlckdyb3VwcyxcbiAgICAgICAgYWxsRGVjb3JhdGVkQ29sdW1ucyxcbiAgICAgICAgaGFzSGVhZGVyR3JvdXBzLFxuICAgICAgfVxuICAgIH1cblxuICAgIGdldFNvcnRlZERhdGEgKHJlc29sdmVkU3RhdGUpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgbWFudWFsLFxuICAgICAgICBzb3J0ZWQsXG4gICAgICAgIGZpbHRlcmVkLFxuICAgICAgICBkZWZhdWx0RmlsdGVyTWV0aG9kLFxuICAgICAgICByZXNvbHZlZERhdGEsXG4gICAgICAgIHZpc2libGVDb2x1bW5zLFxuICAgICAgICBhbGxEZWNvcmF0ZWRDb2x1bW5zLFxuICAgICAgfSA9IHJlc29sdmVkU3RhdGVcblxuICAgICAgY29uc3Qgc29ydE1ldGhvZHNCeUNvbHVtbklEID0ge31cblxuICAgICAgYWxsRGVjb3JhdGVkQ29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5zb3J0TWV0aG9kKS5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgIHNvcnRNZXRob2RzQnlDb2x1bW5JRFtjb2wuaWRdID0gY29sLnNvcnRNZXRob2RcbiAgICAgIH0pXG5cbiAgICAgIC8vIFJlc29sdmUgdGhlIGRhdGEgZnJvbSBlaXRoZXIgbWFudWFsIGRhdGEgb3Igc29ydGVkIGRhdGFcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvcnRlZERhdGE6IG1hbnVhbFxuICAgICAgICAgID8gcmVzb2x2ZWREYXRhXG4gICAgICAgICAgOiB0aGlzLnNvcnREYXRhKFxuICAgICAgICAgICAgdGhpcy5maWx0ZXJEYXRhKHJlc29sdmVkRGF0YSwgZmlsdGVyZWQsIGRlZmF1bHRGaWx0ZXJNZXRob2QsIHZpc2libGVDb2x1bW5zKSxcbiAgICAgICAgICAgIHNvcnRlZCxcbiAgICAgICAgICAgIHNvcnRNZXRob2RzQnlDb2x1bW5JRFxuICAgICAgICAgICksXG4gICAgICB9XG4gICAgfVxuXG4gICAgZmlyZUZldGNoRGF0YSAoKSB7XG4gICAgICB0aGlzLnByb3BzLm9uRmV0Y2hEYXRhKHRoaXMuZ2V0UmVzb2x2ZWRTdGF0ZSgpLCB0aGlzKVxuICAgIH1cblxuICAgIGdldFByb3BPclN0YXRlIChrZXkpIHtcbiAgICAgIHJldHVybiBfLmdldEZpcnN0RGVmaW5lZCh0aGlzLnByb3BzW2tleV0sIHRoaXMuc3RhdGVba2V5XSlcbiAgICB9XG5cbiAgICBnZXRTdGF0ZU9yUHJvcCAoa2V5KSB7XG4gICAgICByZXR1cm4gXy5nZXRGaXJzdERlZmluZWQodGhpcy5zdGF0ZVtrZXldLCB0aGlzLnByb3BzW2tleV0pXG4gICAgfVxuXG4gICAgZmlsdGVyRGF0YSAoZGF0YSwgZmlsdGVyZWQsIGRlZmF1bHRGaWx0ZXJNZXRob2QsIHZpc2libGVDb2x1bW5zKSB7XG4gICAgICBsZXQgZmlsdGVyZWREYXRhID0gZGF0YVxuXG4gICAgICBpZiAoZmlsdGVyZWQubGVuZ3RoKSB7XG4gICAgICAgIGZpbHRlcmVkRGF0YSA9IGZpbHRlcmVkLnJlZHVjZSgoZmlsdGVyZWRTb0ZhciwgbmV4dEZpbHRlcikgPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbHVtbiA9IHZpc2libGVDb2x1bW5zLmZpbmQoeCA9PiB4LmlkID09PSBuZXh0RmlsdGVyLmlkKVxuXG4gICAgICAgICAgLy8gRG9uJ3QgZmlsdGVyIGhpZGRlbiBjb2x1bW5zIG9yIGNvbHVtbnMgdGhhdCBoYXZlIGhhZCB0aGVpciBmaWx0ZXJzIGRpc2FibGVkXG4gICAgICAgICAgaWYgKCFjb2x1bW4gfHwgY29sdW1uLmZpbHRlcmFibGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyZWRTb0ZhclxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGZpbHRlck1ldGhvZCA9IGNvbHVtbi5maWx0ZXJNZXRob2QgfHwgZGVmYXVsdEZpbHRlck1ldGhvZFxuXG4gICAgICAgICAgLy8gSWYgJ2ZpbHRlckFsbCcgaXMgc2V0IHRvIHRydWUsIHBhc3MgdGhlIGVudGlyZSBkYXRhc2V0IHRvIHRoZSBmaWx0ZXIgbWV0aG9kXG4gICAgICAgICAgaWYgKGNvbHVtbi5maWx0ZXJBbGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJNZXRob2QobmV4dEZpbHRlciwgZmlsdGVyZWRTb0ZhciwgY29sdW1uKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmlsdGVyZWRTb0Zhci5maWx0ZXIocm93ID0+IGZpbHRlck1ldGhvZChuZXh0RmlsdGVyLCByb3csIGNvbHVtbikpXG4gICAgICAgIH0sIGZpbHRlcmVkRGF0YSlcblxuICAgICAgICAvLyBBcHBseSB0aGUgZmlsdGVyIHRvIHRoZSBzdWJyb3dzIGlmIHdlIGFyZSBwaXZvdGluZywgYW5kIHRoZW5cbiAgICAgICAgLy8gZmlsdGVyIGFueSByb3dzIHdpdGhvdXQgc3ViY29sdW1ucyBiZWNhdXNlIGl0IHdvdWxkIGJlIHN0cmFuZ2UgdG8gc2hvd1xuICAgICAgICBmaWx0ZXJlZERhdGEgPSBmaWx0ZXJlZERhdGFcbiAgICAgICAgICAubWFwKHJvdyA9PiB7XG4gICAgICAgICAgICBpZiAoIXJvd1t0aGlzLnByb3BzLnN1YlJvd3NLZXldKSB7XG4gICAgICAgICAgICAgIHJldHVybiByb3dcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIC4uLnJvdyxcbiAgICAgICAgICAgICAgW3RoaXMucHJvcHMuc3ViUm93c0tleV06IHRoaXMuZmlsdGVyRGF0YShcbiAgICAgICAgICAgICAgICByb3dbdGhpcy5wcm9wcy5zdWJSb3dzS2V5XSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJlZCxcbiAgICAgICAgICAgICAgICBkZWZhdWx0RmlsdGVyTWV0aG9kLFxuICAgICAgICAgICAgICAgIHZpc2libGVDb2x1bW5zXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZmlsdGVyKHJvdyA9PiB7XG4gICAgICAgICAgICBpZiAoIXJvd1t0aGlzLnByb3BzLnN1YlJvd3NLZXldKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcm93W3RoaXMucHJvcHMuc3ViUm93c0tleV0ubGVuZ3RoID4gMFxuICAgICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmaWx0ZXJlZERhdGFcbiAgICB9XG5cbiAgICBzb3J0RGF0YSAoZGF0YSwgc29ydGVkLCBzb3J0TWV0aG9kc0J5Q29sdW1uSUQgPSB7fSkge1xuICAgICAgaWYgKCFzb3J0ZWQubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBkYXRhXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNvcnRlZERhdGEgPSAodGhpcy5wcm9wcy5vcmRlckJ5TWV0aG9kIHx8IF8ub3JkZXJCeSkoXG4gICAgICAgIGRhdGEsXG4gICAgICAgIHNvcnRlZC5tYXAoc29ydCA9PiB7XG4gICAgICAgICAgLy8gU3VwcG9ydCBjdXN0b20gc29ydGluZyBtZXRob2RzIGZvciBlYWNoIGNvbHVtblxuICAgICAgICAgIGlmIChzb3J0TWV0aG9kc0J5Q29sdW1uSURbc29ydC5pZF0pIHtcbiAgICAgICAgICAgIHJldHVybiAoYSwgYikgPT4gc29ydE1ldGhvZHNCeUNvbHVtbklEW3NvcnQuaWRdKGFbc29ydC5pZF0sIGJbc29ydC5pZF0sIHNvcnQuZGVzYylcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIChhLCBiKSA9PiB0aGlzLnByb3BzLmRlZmF1bHRTb3J0TWV0aG9kKGFbc29ydC5pZF0sIGJbc29ydC5pZF0sIHNvcnQuZGVzYylcbiAgICAgICAgfSksXG4gICAgICAgIHNvcnRlZC5tYXAoZCA9PiAhZC5kZXNjKSxcbiAgICAgICAgdGhpcy5wcm9wcy5pbmRleEtleVxuICAgICAgKVxuXG4gICAgICBzb3J0ZWREYXRhLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgaWYgKCFyb3dbdGhpcy5wcm9wcy5zdWJSb3dzS2V5XSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHJvd1t0aGlzLnByb3BzLnN1YlJvd3NLZXldID0gdGhpcy5zb3J0RGF0YShcbiAgICAgICAgICByb3dbdGhpcy5wcm9wcy5zdWJSb3dzS2V5XSxcbiAgICAgICAgICBzb3J0ZWQsXG4gICAgICAgICAgc29ydE1ldGhvZHNCeUNvbHVtbklEXG4gICAgICAgIClcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBzb3J0ZWREYXRhXG4gICAgfVxuXG4gICAgZ2V0TWluUm93cyAoKSB7XG4gICAgICByZXR1cm4gXy5nZXRGaXJzdERlZmluZWQodGhpcy5wcm9wcy5taW5Sb3dzLCB0aGlzLmdldFN0YXRlT3JQcm9wKCdwYWdlU2l6ZScpKVxuICAgIH1cblxuICAgIC8vIFVzZXIgYWN0aW9uc1xuICAgIG9uUGFnZUNoYW5nZSAocGFnZSkge1xuICAgICAgY29uc3QgeyBvblBhZ2VDaGFuZ2UsIGNvbGxhcHNlT25QYWdlQ2hhbmdlIH0gPSB0aGlzLnByb3BzXG5cbiAgICAgIGNvbnN0IG5ld1N0YXRlID0geyBwYWdlIH1cbiAgICAgIGlmIChjb2xsYXBzZU9uUGFnZUNoYW5nZSkge1xuICAgICAgICBuZXdTdGF0ZS5leHBhbmRlZCA9IHt9XG4gICAgICB9XG4gICAgICB0aGlzLnNldFN0YXRlV2l0aERhdGEobmV3U3RhdGUsICgpID0+IG9uUGFnZUNoYW5nZSAmJiBvblBhZ2VDaGFuZ2UocGFnZSkpXG4gICAgfVxuXG4gICAgb25QYWdlU2l6ZUNoYW5nZSAobmV3UGFnZVNpemUpIHtcbiAgICAgIGNvbnN0IHsgb25QYWdlU2l6ZUNoYW5nZSB9ID0gdGhpcy5wcm9wc1xuICAgICAgY29uc3QgeyBwYWdlU2l6ZSwgcGFnZSB9ID0gdGhpcy5nZXRSZXNvbHZlZFN0YXRlKClcblxuICAgICAgLy8gTm9ybWFsaXplIHRoZSBwYWdlIHRvIGRpc3BsYXlcbiAgICAgIGNvbnN0IGN1cnJlbnRSb3cgPSBwYWdlU2l6ZSAqIHBhZ2VcbiAgICAgIGNvbnN0IG5ld1BhZ2UgPSBNYXRoLmZsb29yKGN1cnJlbnRSb3cgLyBuZXdQYWdlU2l6ZSlcblxuICAgICAgdGhpcy5zZXRTdGF0ZVdpdGhEYXRhKFxuICAgICAgICB7XG4gICAgICAgICAgcGFnZVNpemU6IG5ld1BhZ2VTaXplLFxuICAgICAgICAgIHBhZ2U6IG5ld1BhZ2UsXG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IG9uUGFnZVNpemVDaGFuZ2UgJiYgb25QYWdlU2l6ZUNoYW5nZShuZXdQYWdlU2l6ZSwgbmV3UGFnZSlcbiAgICAgIClcbiAgICB9XG5cbiAgICBzb3J0Q29sdW1uIChjb2x1bW4sIGFkZGl0aXZlKSB7XG4gICAgICBjb25zdCB7IHNvcnRlZCwgc2tpcE5leHRTb3J0LCBkZWZhdWx0U29ydERlc2MgfSA9IHRoaXMuZ2V0UmVzb2x2ZWRTdGF0ZSgpXG5cbiAgICAgIGNvbnN0IGZpcnN0U29ydERpcmVjdGlvbiA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb2x1bW4sICdkZWZhdWx0U29ydERlc2MnKVxuICAgICAgICA/IGNvbHVtbi5kZWZhdWx0U29ydERlc2NcbiAgICAgICAgOiBkZWZhdWx0U29ydERlc2NcbiAgICAgIGNvbnN0IHNlY29uZFNvcnREaXJlY3Rpb24gPSAhZmlyc3RTb3J0RGlyZWN0aW9uXG5cbiAgICAgIC8vIHdlIGNhbid0IHN0b3AgZXZlbnQgcHJvcGFnYXRpb24gZnJvbSB0aGUgY29sdW1uIHJlc2l6ZSBtb3ZlIGhhbmRsZXJzXG4gICAgICAvLyBhdHRhY2hlZCB0byB0aGUgZG9jdW1lbnQgYmVjYXVzZSBvZiByZWFjdCdzIHN5bnRoZXRpYyBldmVudHNcbiAgICAgIC8vIHNvIHdlIGhhdmUgdG8gcHJldmVudCB0aGUgc29ydCBmdW5jdGlvbiBmcm9tIGFjdHVhbGx5IHNvcnRpbmdcbiAgICAgIC8vIGlmIHdlIGNsaWNrIG9uIHRoZSBjb2x1bW4gcmVzaXplIGVsZW1lbnQgd2l0aGluIGEgaGVhZGVyLlxuICAgICAgaWYgKHNraXBOZXh0U29ydCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlV2l0aERhdGEoe1xuICAgICAgICAgIHNraXBOZXh0U29ydDogZmFsc2UsXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCB7IG9uU29ydGVkQ2hhbmdlIH0gPSB0aGlzLnByb3BzXG5cbiAgICAgIGxldCBuZXdTb3J0ZWQgPSBfLmNsb25lKHNvcnRlZCB8fCBbXSkubWFwKGQgPT4ge1xuICAgICAgICBkLmRlc2MgPSBfLmlzU29ydGluZ0Rlc2MoZClcbiAgICAgICAgcmV0dXJuIGRcbiAgICAgIH0pXG4gICAgICBpZiAoIV8uaXNBcnJheShjb2x1bW4pKSB7XG4gICAgICAgIC8vIFNpbmdsZS1Tb3J0XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nSW5kZXggPSBuZXdTb3J0ZWQuZmluZEluZGV4KGQgPT4gZC5pZCA9PT0gY29sdW1uLmlkKVxuICAgICAgICBpZiAoZXhpc3RpbmdJbmRleCA+IC0xKSB7XG4gICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBuZXdTb3J0ZWRbZXhpc3RpbmdJbmRleF1cbiAgICAgICAgICBpZiAoZXhpc3RpbmcuZGVzYyA9PT0gc2Vjb25kU29ydERpcmVjdGlvbikge1xuICAgICAgICAgICAgaWYgKGFkZGl0aXZlKSB7XG4gICAgICAgICAgICAgIG5ld1NvcnRlZC5zcGxpY2UoZXhpc3RpbmdJbmRleCwgMSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGV4aXN0aW5nLmRlc2MgPSBmaXJzdFNvcnREaXJlY3Rpb25cbiAgICAgICAgICAgICAgbmV3U29ydGVkID0gW2V4aXN0aW5nXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleGlzdGluZy5kZXNjID0gc2Vjb25kU29ydERpcmVjdGlvblxuICAgICAgICAgICAgaWYgKCFhZGRpdGl2ZSkge1xuICAgICAgICAgICAgICBuZXdTb3J0ZWQgPSBbZXhpc3RpbmddXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGFkZGl0aXZlKSB7XG4gICAgICAgICAgbmV3U29ydGVkLnB1c2goe1xuICAgICAgICAgICAgaWQ6IGNvbHVtbi5pZCxcbiAgICAgICAgICAgIGRlc2M6IGZpcnN0U29ydERpcmVjdGlvbixcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld1NvcnRlZCA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaWQ6IGNvbHVtbi5pZCxcbiAgICAgICAgICAgICAgZGVzYzogZmlyc3RTb3J0RGlyZWN0aW9uLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE11bHRpLVNvcnRcbiAgICAgICAgY29uc3QgZXhpc3RpbmdJbmRleCA9IG5ld1NvcnRlZC5maW5kSW5kZXgoZCA9PiBkLmlkID09PSBjb2x1bW5bMF0uaWQpXG4gICAgICAgIC8vIEV4aXN0aW5nIFNvcnRlZCBDb2x1bW5cbiAgICAgICAgaWYgKGV4aXN0aW5nSW5kZXggPiAtMSkge1xuICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gbmV3U29ydGVkW2V4aXN0aW5nSW5kZXhdXG4gICAgICAgICAgaWYgKGV4aXN0aW5nLmRlc2MgPT09IHNlY29uZFNvcnREaXJlY3Rpb24pIHtcbiAgICAgICAgICAgIGlmIChhZGRpdGl2ZSkge1xuICAgICAgICAgICAgICBuZXdTb3J0ZWQuc3BsaWNlKGV4aXN0aW5nSW5kZXgsIGNvbHVtbi5sZW5ndGgpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb2x1bW4uZm9yRWFjaCgoZCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIG5ld1NvcnRlZFtleGlzdGluZ0luZGV4ICsgaV0uZGVzYyA9IGZpcnN0U29ydERpcmVjdGlvblxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb2x1bW4uZm9yRWFjaCgoZCwgaSkgPT4ge1xuICAgICAgICAgICAgICBuZXdTb3J0ZWRbZXhpc3RpbmdJbmRleCArIGldLmRlc2MgPSBzZWNvbmRTb3J0RGlyZWN0aW9uXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWFkZGl0aXZlKSB7XG4gICAgICAgICAgICBuZXdTb3J0ZWQgPSBuZXdTb3J0ZWQuc2xpY2UoZXhpc3RpbmdJbmRleCwgY29sdW1uLmxlbmd0aClcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gTmV3IFNvcnQgQ29sdW1uXG4gICAgICAgIH0gZWxzZSBpZiAoYWRkaXRpdmUpIHtcbiAgICAgICAgICBuZXdTb3J0ZWQgPSBuZXdTb3J0ZWQuY29uY2F0KFxuICAgICAgICAgICAgY29sdW1uLm1hcChkID0+ICh7XG4gICAgICAgICAgICAgIGlkOiBkLmlkLFxuICAgICAgICAgICAgICBkZXNjOiBmaXJzdFNvcnREaXJlY3Rpb24sXG4gICAgICAgICAgICB9KSlcbiAgICAgICAgICApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3U29ydGVkID0gY29sdW1uLm1hcChkID0+ICh7XG4gICAgICAgICAgICBpZDogZC5pZCxcbiAgICAgICAgICAgIGRlc2M6IGZpcnN0U29ydERpcmVjdGlvbixcbiAgICAgICAgICB9KSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFN0YXRlV2l0aERhdGEoXG4gICAgICAgIHtcbiAgICAgICAgICBwYWdlOiAoIXNvcnRlZC5sZW5ndGggJiYgbmV3U29ydGVkLmxlbmd0aCkgfHwgIWFkZGl0aXZlID8gMCA6IHRoaXMuc3RhdGUucGFnZSxcbiAgICAgICAgICBzb3J0ZWQ6IG5ld1NvcnRlZCxcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4gb25Tb3J0ZWRDaGFuZ2UgJiYgb25Tb3J0ZWRDaGFuZ2UobmV3U29ydGVkLCBjb2x1bW4sIGFkZGl0aXZlKVxuICAgICAgKVxuICAgIH1cblxuICAgIGZpbHRlckNvbHVtbiAoY29sdW1uLCB2YWx1ZSkge1xuICAgICAgY29uc3QgeyBmaWx0ZXJlZCB9ID0gdGhpcy5nZXRSZXNvbHZlZFN0YXRlKClcbiAgICAgIGNvbnN0IHsgb25GaWx0ZXJlZENoYW5nZSB9ID0gdGhpcy5wcm9wc1xuXG4gICAgICAvLyBSZW1vdmUgb2xkIGZpbHRlciBmaXJzdCBpZiBpdCBleGlzdHNcbiAgICAgIGNvbnN0IG5ld0ZpbHRlcmluZyA9IChmaWx0ZXJlZCB8fCBbXSkuZmlsdGVyKHggPT4geC5pZCAhPT0gY29sdW1uLmlkKVxuXG4gICAgICBpZiAodmFsdWUgIT09ICcnKSB7XG4gICAgICAgIG5ld0ZpbHRlcmluZy5wdXNoKHtcbiAgICAgICAgICBpZDogY29sdW1uLmlkLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFN0YXRlV2l0aERhdGEoXG4gICAgICAgIHtcbiAgICAgICAgICBmaWx0ZXJlZDogbmV3RmlsdGVyaW5nLFxuICAgICAgICB9LFxuICAgICAgICAoKSA9PiBvbkZpbHRlcmVkQ2hhbmdlICYmIG9uRmlsdGVyZWRDaGFuZ2UobmV3RmlsdGVyaW5nLCBjb2x1bW4sIHZhbHVlKVxuICAgICAgKVxuICAgIH1cblxuICAgIHJlc2l6ZUNvbHVtblN0YXJ0IChldmVudCwgY29sdW1uLCBpc1RvdWNoKSB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgY29uc3QgcGFyZW50V2lkdGggPSBldmVudC50YXJnZXQucGFyZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxuXG4gICAgICBsZXQgcGFnZVhcbiAgICAgIGlmIChpc1RvdWNoKSB7XG4gICAgICAgIHBhZ2VYID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVhcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhZ2VYID0gZXZlbnQucGFnZVhcbiAgICAgIH1cblxuICAgICAgdGhpcy50cmFwRXZlbnRzID0gdHJ1ZVxuICAgICAgdGhpcy5zZXRTdGF0ZVdpdGhEYXRhKFxuICAgICAgICB7XG4gICAgICAgICAgY3VycmVudGx5UmVzaXppbmc6IHtcbiAgICAgICAgICAgIGlkOiBjb2x1bW4uaWQsXG4gICAgICAgICAgICBzdGFydFg6IHBhZ2VYLFxuICAgICAgICAgICAgcGFyZW50V2lkdGgsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIGlmIChpc1RvdWNoKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLnJlc2l6ZUNvbHVtbk1vdmluZylcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5yZXNpemVDb2x1bW5FbmQpXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMucmVzaXplQ29sdW1uRW5kKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLnJlc2l6ZUNvbHVtbk1vdmluZylcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLnJlc2l6ZUNvbHVtbkVuZClcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLnJlc2l6ZUNvbHVtbkVuZClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9XG5cbiAgICByZXNpemVDb2x1bW5Nb3ZpbmcgKGV2ZW50KSB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgY29uc3QgeyBvblJlc2l6ZWRDaGFuZ2UgfSA9IHRoaXMucHJvcHNcbiAgICAgIGNvbnN0IHsgcmVzaXplZCwgY3VycmVudGx5UmVzaXppbmcgfSA9IHRoaXMuZ2V0UmVzb2x2ZWRTdGF0ZSgpXG5cbiAgICAgIC8vIERlbGV0ZSBvbGQgdmFsdWVcbiAgICAgIGNvbnN0IG5ld1Jlc2l6ZWQgPSByZXNpemVkLmZpbHRlcih4ID0+IHguaWQgIT09IGN1cnJlbnRseVJlc2l6aW5nLmlkKVxuXG4gICAgICBsZXQgcGFnZVhcblxuICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICd0b3VjaG1vdmUnKSB7XG4gICAgICAgIHBhZ2VYID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVhcbiAgICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PT0gJ21vdXNlbW92ZScpIHtcbiAgICAgICAgcGFnZVggPSBldmVudC5wYWdlWFxuICAgICAgfVxuXG4gICAgICAvLyBTZXQgdGhlIG1pbiBzaXplIHRvIDEwIHRvIGFjY291bnQgZm9yIG1hcmdpbiBhbmQgYm9yZGVyIG9yIGVsc2UgdGhlXG4gICAgICAvLyBncm91cCBoZWFkZXJzIGRvbid0IGxpbmUgdXAgY29ycmVjdGx5XG4gICAgICBjb25zdCBuZXdXaWR0aCA9IE1hdGgubWF4KFxuICAgICAgICBjdXJyZW50bHlSZXNpemluZy5wYXJlbnRXaWR0aCArIHBhZ2VYIC0gY3VycmVudGx5UmVzaXppbmcuc3RhcnRYLFxuICAgICAgICAxMVxuICAgICAgKVxuXG4gICAgICBuZXdSZXNpemVkLnB1c2goe1xuICAgICAgICBpZDogY3VycmVudGx5UmVzaXppbmcuaWQsXG4gICAgICAgIHZhbHVlOiBuZXdXaWR0aCxcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuc2V0U3RhdGVXaXRoRGF0YShcbiAgICAgICAge1xuICAgICAgICAgIHJlc2l6ZWQ6IG5ld1Jlc2l6ZWQsXG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IG9uUmVzaXplZENoYW5nZSAmJiBvblJlc2l6ZWRDaGFuZ2UobmV3UmVzaXplZCwgZXZlbnQpXG4gICAgICApXG4gICAgfVxuXG4gICAgcmVzaXplQ29sdW1uRW5kIChldmVudCkge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIGNvbnN0IGlzVG91Y2ggPSBldmVudC50eXBlID09PSAndG91Y2hlbmQnIHx8IGV2ZW50LnR5cGUgPT09ICd0b3VjaGNhbmNlbCdcblxuICAgICAgaWYgKGlzVG91Y2gpIHtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5yZXNpemVDb2x1bW5Nb3ZpbmcpXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5yZXNpemVDb2x1bW5FbmQpXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5yZXNpemVDb2x1bW5FbmQpXG4gICAgICB9XG5cbiAgICAgIC8vIElmIGl0cyBhIHRvdWNoIGV2ZW50IGNsZWFyIHRoZSBtb3VzZSBvbmUncyBhcyB3ZWxsIGJlY2F1c2Ugc29tZXRpbWVzXG4gICAgICAvLyB0aGUgbW91c2VEb3duIGV2ZW50IGdldHMgY2FsbGVkIGFzIHdlbGwsIGJ1dCB0aGUgbW91c2VVcCBldmVudCBkb2Vzbid0XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLnJlc2l6ZUNvbHVtbk1vdmluZylcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLnJlc2l6ZUNvbHVtbkVuZClcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLnJlc2l6ZUNvbHVtbkVuZClcblxuICAgICAgLy8gVGhlIHRvdWNoIGV2ZW50cyBkb24ndCBwcm9wYWdhdGUgdXAgdG8gdGhlIHNvcnRpbmcncyBvbk1vdXNlRG93biBldmVudCBzb1xuICAgICAgLy8gbm8gbmVlZCB0byBwcmV2ZW50IGl0IGZyb20gaGFwcGVuaW5nIG9yIGVsc2UgdGhlIGZpcnN0IGNsaWNrIGFmdGVyIGEgdG91Y2hcbiAgICAgIC8vIGV2ZW50IHJlc2l6ZSB3aWxsIG5vdCBzb3J0IHRoZSBjb2x1bW4uXG4gICAgICBpZiAoIWlzVG91Y2gpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZVdpdGhEYXRhKHtcbiAgICAgICAgICBza2lwTmV4dFNvcnQ6IHRydWUsXG4gICAgICAgICAgY3VycmVudGx5UmVzaXppbmc6IGZhbHNlLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuIl19