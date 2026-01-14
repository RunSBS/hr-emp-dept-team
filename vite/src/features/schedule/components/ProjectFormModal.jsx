import { Modal, Button, Form } from "react-bootstrap";

const ProjectFormModal = ({
                              show,
                              mode,           // "create" | "edit"
                              form,
                              onChange,
                              onSubmit,
                              onClose
                          }) => {
    const isEdit = mode === "edit";

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEdit ? "프로젝트 수정" : "프로젝트 생성"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="mb-2">
                        <Form.Label>이름</Form.Label>
                        <Form.Control
                            name="name"
                            value={form.name}
                            onChange={onChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>설명</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            value={form.description}
                            onChange={onChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>방법론</Form.Label>
                        <Form.Control
                            name="methodology"
                            value={form.methodology}
                            onChange={onChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>시작일</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="startDate"
                            value={form.startDate}
                            onChange={onChange}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>종료일</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="endDate"
                            value={form.endDate}
                            onChange={onChange}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    취소
                </Button>
                <Button variant="primary" onClick={onSubmit}>
                    {isEdit ? "수정" : "생성"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProjectFormModal;
