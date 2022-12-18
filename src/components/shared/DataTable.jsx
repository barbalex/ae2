import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import { visuallyHidden } from '@mui/utils'

// data is array of objects
// keys are column names
// values are column values
const DataTable = ({ data, order = 'ASC', orderBy = 'id', setOrder }) => {
  const columnNames = Object.keys(data[0])

  return (
    <TableContainer component={Paper}>
      <Table
        sx={{ minWidth: 650, fontSize: 'small !important' }}
        size="small"
        aria-label="Export Vorschau"
        stickyHeader={true}
      >
        <TableHead sx={{ backgroundColor: '#f6f6f6' }}>
          <TableRow>
            {columnNames.map((name) => {
              if (name === 'id') {
                return (
                  <TableCell key={name} sx={{ minWidth: 270 }}>
                    {name}
                  </TableCell>
                )
              }

              return (
                <TableCell
                  key={name}
                  sortDirection={orderBy === name ? order.toLowerCase() : false}
                >
                  <TableSortLabel
                    active={orderBy === name}
                    direction={orderBy === name ? order.toLowerCase() : 'asc'}
                    onClick={() =>
                      setOrder({
                        by: name,
                        direction: order === 'ASC' ? 'DESC' : 'ASC',
                      })
                    }
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
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => {
            const keys = Object.keys(row).filter((k) => k !== 'id')

            return (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{ fontSize: '0.8rem' }}
                >
                  {row.id}
                </TableCell>
                {keys.map((key) => (
                  <TableCell key={key}>{row[key]}</TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default DataTable
