import React, { useState } from 'react'

const CountInput = ({ count, setCount }) => {
  const [value, setValue] = useState(count)

  return (
    <input
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.valueAsNumber)}
      onBlur={(e) => setCount(e.target.valueAsNumber)}
      style={{ width: 70 }}
    />
  )
}

export default CountInput
