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

// data is array of objects
// keys are column names
// values are column values
const DataTable = ({
  data,
  order = 'ASC',
  orderBy = 'id',
  setOrder,
  idKey = 'id',
}) => {
  const columnNames = Object.keys(data[0])

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
                if (name === idKey) {
                  return (
                    <TableCell
                      key={name}
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
                    key={name}
                    sortDirection={
                      orderBy === name ? order.toLowerCase() : false
                    }
                    sx={{
                      '&:first-of-type': { paddingLeft: '6px !important' },
                      backgroundColor: '#ffcc80 !important',
                      // prevent hideous high headers
                      minWidth: 200,
                    }}
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
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <StyledTableRow
                key={row[idKey]}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                {columnNames.map((key) => {
                  if (key === idKey)
                    return (
                      <TableCell
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
                  return <TableCell key={key}>{row[key]}</TableCell>
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
