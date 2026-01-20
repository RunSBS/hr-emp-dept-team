package boot.team.hr.min.invite.repository;

import aj.org.objectweb.asm.commons.Remapper;
import boot.team.hr.min.invite.entity.Invite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InviteRepository extends JpaRepository<Invite,Long> {

    Optional<Invite> findByEmailAndStatus(String email, String status);

    Page<Invite> findByStatus(String status, Pageable pageable);
}
