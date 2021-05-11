import React from 'react';
import { Modal } from 'react-bootstrap';
import ModalDialog from 'react-bootstrap/cjs/ModalDialog';
import Draggable from 'react-draggable';

class DraggableModalDialog extends React.Component {
	render() {
		return <Draggable handle=".modal-title">
					<ModalDialog {...this.props} />
			   </Draggable>
	}
}
 
// enforceForce=false causes recursion exception otherwise....
export default ({titleIconClass, modalClass, title, body, footer, ...props}) =>
	<Modal dialogComponentClass={DraggableModalDialog} show={true} enforceFocus={false} backdrop="static" {...props}>
		<Modal.Header closeButton>
			<Modal.Title>
				{title}
			</Modal.Title>
		</Modal.Header>
		<Modal.Body>
			{body}
		</Modal.Body>
      <Modal.Footer>
         {footer}
      </Modal.Footer>
	</Modal>