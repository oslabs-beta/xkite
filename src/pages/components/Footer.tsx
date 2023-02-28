import React from 'react';
import { MDBFooter } from 'mdb-react-ui-kit';

export default function Footer() {
  return (
    <MDBFooter bgColor='light' className='text-center text-lg-start text-muted'>
      <div
        className='text-center p-3'
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
      >
        © 2023 Copyright:
        <a className='text-reset fw-bold' href='https:www.xkite.io'>
          www.xkite.io
        </a>
      </div>
    </MDBFooter>
  );
}
