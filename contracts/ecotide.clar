;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-project (err u101))
(define-constant err-project-full (err u102))
(define-constant err-already-joined (err u103))
(define-constant err-not-participant (err u104))
(define-constant err-invalid-params (err u105))
(define-constant err-inactive-project (err u106))

;; Define token
(define-fungible-token eco-token)

;; Events
(define-data-var last-event-id uint u0)

;; Data structures
(define-map projects
  { project-id: uint }
  {
    name: (string-ascii 50),
    description: (string-ascii 500),
    creator: principal,
    max-participants: uint,
    current-participants: uint,
    reward-pool: uint,
    status: (string-ascii 20),
    participants: (list 50 principal)
  }
)

(define-data-var next-project-id uint u1)

;; Public functions
(define-public (create-project (name (string-ascii 50)) 
                             (description (string-ascii 500))
                             (max-participants uint)
                             (reward-pool uint))
  (begin
    ;; Input validation
    (asserts! (> max-participants u0) (err err-invalid-params))
    (asserts! (> reward-pool u0) (err err-invalid-params))
    (asserts! (>= (* max-participants u1) reward-pool) (err err-invalid-params))
    
    (let ((project-id (var-get next-project-id)))
      (try! (ft-mint? eco-token reward-pool tx-sender))
      (map-set projects
        { project-id: project-id }
        {
          name: name,
          description: description,
          creator: tx-sender,
          max-participants: max-participants,
          current-participants: u0,
          reward-pool: reward-pool,
          status: "active",
          participants: (list)
        }
      )
      (var-set next-project-id (+ project-id u1))
      (print { event: "project-created", project-id: project-id })
      (ok project-id)
    )
  )
)

(define-public (join-project (project-id uint))
  (let ((project (unwrap! (map-get? projects { project-id: project-id }) 
                         (err err-invalid-project))))
    (asserts! (is-eq (get status project) "active")
             (err err-inactive-project))
    (asserts! (< (get current-participants project) (get max-participants project))
             (err err-project-full))
    (asserts! (not (is-participant tx-sender (get participants project)))
             (err err-already-joined))
    (map-set projects
      { project-id: project-id }
      (merge project {
        current-participants: (+ (get current-participants project) u1),
        participants: (unwrap-panic (as-max-len? 
          (append (get participants project) tx-sender) u50))
      })
    )
    (print { event: "project-joined", project-id: project-id, participant: tx-sender })
    (ok true)
  )
)

(define-public (complete-project (project-id uint))
  (let ((project (unwrap! (map-get? projects { project-id: project-id })
                         (err err-invalid-project))))
    (asserts! (is-eq (get creator project) tx-sender)
             (err err-owner-only))
    (asserts! (is-eq (get status project) "active")
             (err err-inactive-project))
    (let ((reward-per-participant (/ (get reward-pool project) 
                                   (get current-participants project))))
      (map distribute-rewards 
           (get participants project)
           (make-list (len (get participants project)) reward-per-participant))
      (map-set projects
        { project-id: project-id }
        (merge project { status: "completed" })
      )
      (print { event: "project-completed", project-id: project-id })
      (ok true)
    )
  )
)

;; Private functions
(define-private (distribute-rewards (participant principal) (amount uint))
  (try! (ft-transfer? eco-token amount tx-sender participant))
  (ok true)
)

(define-private (is-participant (user principal) (participants (list 50 principal)))
  (not (is-none (index-of participants user)))
)

;; Read only functions
(define-read-only (get-project-details (project-id uint))
  (ok (map-get? projects { project-id: project-id }))
)
