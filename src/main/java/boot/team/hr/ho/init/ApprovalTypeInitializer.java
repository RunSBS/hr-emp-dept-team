package boot.team.hr.ho.init;

import boot.team.hr.ho.entity.ApprovalType;
import boot.team.hr.ho.repository.ApprovalTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ApprovalTypeInitializer implements CommandLineRunner {

    private final ApprovalTypeRepository approvalTypeRepository;

    @Override
    public void run(String... args) {
        if (approvalTypeRepository.count() > 0) {
            return; // 이미 데이터 있으면 아무 것도 안 함
        }

        approvalTypeRepository.save(
                new ApprovalType(10L, "VACATION", "휴가 신청")
        );
        approvalTypeRepository.save(
                new ApprovalType(20L, "REWARD", "포상 신청")
        );
        approvalTypeRepository.save(
                new ApprovalType(30L, "ATTENDANCE", "근태 신청")
        );
        approvalTypeRepository.save(
                new ApprovalType(40L, "EVALUATION", "평가 신청")
        );
        approvalTypeRepository.save(
                new ApprovalType(50L, "SCHEDULE", "일정 신청")
        );
    }
}
