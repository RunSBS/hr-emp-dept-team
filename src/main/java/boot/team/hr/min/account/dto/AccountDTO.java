package boot.team.hr.min.account.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AccountDTO {

    private String email;
    private String password;
    //비밀번호 변경용
    private String currentPassword;
    private String newPassword;
}
