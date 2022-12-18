import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { css } from '@emotion/react'

// data is array of objects
// keys are column names
// values are column values
const DataTable = ({ data }) => {
  const columnNames = Object.keys(data[0])

  return (
    <TableContainer component={Paper}>
      <Table
        sx={{ minWidth: 650, fontSize: '0.8rem !important' }}
        size="small"
        aria-label="a dense table"
      >
        <TableHead>
          <TableRow>
            {columnNames.map((name) => (
              <TableCell key={name}>{name}</TableCell>
            ))}
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
                  sx={{ width: 270, fontSize: '0.8rem' }}
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
