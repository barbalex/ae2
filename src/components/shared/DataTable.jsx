import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Box from '@mui/material/Box'
import { visuallyHidden } from '@mui/utils'
import styled from '@emotion/styled'
import SimpleBar from 'simplebar-react'

const Container = styled.div`
  width: 100%;
  overflow-x: auto;
`
const StyledTableRow = styled(TableRow)`
  padding: 0 5px;
`

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

// data is array of objects
// keys are column names
// values are column values
const DataTable = ({
  data,
  order = 'ASC',
  orderBy = 'id',
  setOrder = () => {
    console.log('no setOrder function provided')
  },
  idKey = 'id',
  uniqueKeyCombo,
}) => {
  const columnNames = Object.keys(data[0])

  // console.log('DataTable, data: ', data)

  return (
    <Container>
      <SimpleBar style={{ maxHeight: '100%', height: '100%' }}>
        <Table
          sx={{
            minWidth: 650,
            fontSize: 'small !important',
            backgroundColor: 'white',
            marginBottom: 0,
          }}
          size="small"
          aria-label="Export Vorschau"
          stickyHeader={true}
        >
          <TableHead>
            <StyledTableRow>
              {columnNames.map((name) => {
                const active = orderBy === name
                // console.log('DataTable ', { name, orderBy, active })
                if (name === idKey) {
                  return (
                    <TableCell
                      key={`${name}/header`}
                      sx={{
                        minWidth: 270,
                        '&:first-of-type': { paddingLeft: '6px !important' },
                        backgroundColor: '#ffcc80 !important',
                      }}
                    >
                      {name}
                    </TableCell>
                  )
                }

                return (
                  <TableCell
                    key={`${name}/header`}
                    sortDirection={active ? order.toLowerCase() : false}
                    sx={{
                      '&:first-of-type': { paddingLeft: '6px !important' },
                      backgroundColor: '#ffcc80 !important',
                      // prevent hideous high headers
                      minWidth: 200,
                    }}
                  >
                    <TableSortLabel
                      active={active}
                      direction={active ? order.toLowerCase() : 'asc'}
                      onClick={() => {
                        // if this is the active sorted column, switch sort direction
                        const direction = active
                          ? order === 'asc'
                            ? 'desc'
                            : 'asc'
                          : order
                        setOrder({
                          orderBy: name,
                          direction,
                        })
                      }}
                    >
                      {name}
                      {orderBy === name ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'DESC'
                            ? 'sorted descending'
                            : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                )
              })}
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {data.sort(getComparator(order, orderBy)).map((row) => (
              <StyledTableRow
                key={
                  uniqueKeyCombo
                    ? `${row[uniqueKeyCombo[0]]}/${row[uniqueKeyCombo[1]]}`
                    : row[idKey]
                }
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                {columnNames.map((key) => {
                  if (key === idKey)
                    return (
                      <TableCell
                        key={`${row[idKey]}/${key}/cell`}
                        component="th"
                        scope="row"
                        sx={{
                          fontSize: '0.8rem',
                          paddingLeft: '6px !important',
                        }}
                      >
                        {row[idKey]}
                      </TableCell>
                    )
                  return (
                    <TableCell key={`${row[idKey]}/${key}/cell`}>
                      {row[key]}
                    </TableCell>
                  )
                })}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </SimpleBar>
    </Container>
  )
}

export default DataTable
