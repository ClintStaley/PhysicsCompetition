import React from 'react';
import { Modal } from 'react-bootstrap';
import ModalDialog from 'react-bootstrap/cjs/ModalDialog';
import Draggable from 'react-draggable';


class DraggableModalDialog extends React.Component {
	render() {
		return <Draggable handle=".modal-header">
			<ModalDialog {...this.props} />
		</Draggable>
	}
}
 
// enforceForce=false causes recursion exception otherwise....
export default ({titleIconClass, modalClass, title, body, footer, ...props}) =>
	<Modal size="lg" dialogAs={DraggableModalDialog} show={true}
	 enforceFocus={false} backdrop="static" {...props}>
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

/*
	export default (show, title, body, footer, ...props) => {
		return (<Draggable handle=".modal-title">
	     <Modal show={!!show} backdrop="static">
		    <Modal.Header>
			   <Modal.Title className="handle">Title</Modal.Title>
		    </Modal.Header>
		    <Modal.Body>
			   Body
		    </Modal.Body>
          <Modal.Footer>
            Footer
          </Modal.Footer>
	     </Modal>
		</Draggable>);
	}

	export default (show, title, body, footer, ...props) => {
		return (<Draggable handle=".handle">
	     <div><div className="handle">Drag</div><div>Body</div></div>
		</Draggable>);
	}

	*/