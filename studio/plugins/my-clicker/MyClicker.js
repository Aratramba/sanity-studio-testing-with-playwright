import React, { useState} from 'react'

const MyClicker = () => {
  const [clicks, setClicks] = useState(0)

  return (
    <div>
      <h2>Click it!</h2>
      <button onClick={() => setClicks((click) => ++click)}>CLICK ME</button> <strong aria-label="counter">{clicks}</strong>
    </div>
  )
}

export default MyClicker