package boot.team.hr.min.invite.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    /**
     * 사원 초대 메일 전송 (HTML)
     *
     * @param toEmail 받는 사람 이메일
     * @param link 가입 완료 링크
     * @throws MessagingException
     */
    public void sendInviteMail(String toEmail, String link) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(toEmail);
        helper.setSubject("[HR] 사원 초대 메일");

        // HTML 템플릿
        String htmlContent = "<!DOCTYPE html>" +
                "<html lang='ko'>" +
                "<head>" +
                "  <meta charset='UTF-8'>" +
                "  <title>HR 초대 메일</title>" +
                "</head>" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.5; color: #333;'>" +
                "  <h2 style='color: #1E3A8A;'>HR 시스템 초대 메일입니다</h2>" +
                "  <p>아래 링크를 클릭하여 가입을 완료해주세요.</p>" +
                "  <a href='" + link + "' " +
                "     style='display: inline-block; padding: 10px 20px; background-color: #1E3A8A; color: #ffffff; " +
                "            text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;'>가입하러 가기</a>" +
                "  <p style='margin-top: 20px; font-size: 12px; color: #888;'>※ 이 메일은 발신 전용입니다.</p>" +
                "</body>" +
                "</html>";

        helper.setText(htmlContent, true); // true = HTML 모드
        mailSender.send(message);
    }
}
