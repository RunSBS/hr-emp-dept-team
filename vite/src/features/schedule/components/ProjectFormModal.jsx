import { Modal, Button, Form } from "react-bootstrap";
import "../styles/project.css";

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
                    {/* 이름 */}
                    <Form.Group className="mb-2">
                        <Form.Label>이름</Form.Label>
                        <Form.Control
                            name="name"
                            value={form.name}
                            onChange={onChange}
                        />
                    </Form.Group>

                    {/* 설명 */}
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

                    {/* 방법론 (select) */}
                    <Form.Group className="mb-2">
                        <Form.Label>방법론</Form.Label>
                        <Form.Select
                            name="methodology"
                            value={form.methodology}
                            onChange={onChange}
                        >
                            <option value="">선택</option>
                            <option value="주먹구구">주먹구구</option>
                            <option value="폭포수">폭포수</option>
                        </Form.Select>
                    </Form.Group>

                    {/* 상태 (select) */}
                    <Form.Group className="mb-2">
                        <Form.Label>상태</Form.Label>
                        <Form.Select
                            name="status"
                            value={form.status}
                            onChange={onChange}
                        >
                            <option value="">선택</option>
                            <option value="미시작">미시작</option>
                            <option value="진행중">진행중</option>
                            <option value="완료">완료</option>
                        </Form.Select>
                    </Form.Group>

                    {/* 시작일 */}
                    <Form.Group className="mb-2">
                        <Form.Label>시작일</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="startDate"
                            value={form.startDate}
                            onChange={onChange}
                        />
                    </Form.Group>

                    {/* 종료일 */}
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
                <Button
                    variant="primary"
                    onClick={onSubmit}
                    className="fc-like-btn"
                >
                    {isEdit ? "수정" : "생성"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProjectFormModal;
