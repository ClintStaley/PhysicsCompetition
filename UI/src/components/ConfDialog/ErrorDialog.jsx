import React, {Component} from 'react';
import {ConfDialog} from '../concentrator.js';
import {ListGroup} from 'react-bootstrap';

export default ({errs, clearErrors}) => 
   <ConfDialog
      show={errs.length > 0}
      title="Error Notice"
      body={<ListGroup>
         {errs.map((err, i) => 
            <ListGroup.Item key={i} bsstyle="danger">
               {err}
            </ListGroup.Item>
         )}
      </ListGroup>}
      buttons={['OK']}
      onClose={() => clearErrors()}
   />;