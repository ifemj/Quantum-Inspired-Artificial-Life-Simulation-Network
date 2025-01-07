;; Collaborative Research Platform Contract

(define-map research-projects
  uint
  {
    title: (string-ascii 100),
    description: (string-utf8 1000),
    lead-researcher: principal,
    collaborators: (list 20 principal),
    status: (string-ascii 20)
  }
)

(define-map project-contributions
  { project-id: uint, contributor: principal }
  {
    contribution: (string-utf8 1000),
    timestamp: uint
  }
)

(define-data-var project-count uint u0)

(define-constant ERR_NOT_AUTHORIZED (err u403))
(define-constant ERR_INVALID_PROJECT (err u404))

(define-public (create-project (title (string-ascii 100)) (description (string-utf8 1000)))
  (let
    (
      (project-id (+ (var-get project-count) u1))
    )
    (map-set research-projects
      project-id
      {
        title: title,
        description: description,
        lead-researcher: tx-sender,
        collaborators: (list tx-sender),
        status: "active"
      }
    )
    (var-set project-count project-id)
    (ok project-id)
  )
)

(define-public (add-collaborator (project-id uint) (collaborator principal))
  (let
    (
      (project (unwrap! (map-get? research-projects project-id) ERR_INVALID_PROJECT))
    )
    (asserts! (is-eq tx-sender (get lead-researcher project)) ERR_NOT_AUTHORIZED)
    (ok (map-set research-projects
      project-id
      (merge project {
        collaborators: (unwrap! (as-max-len? (append (get collaborators project) collaborator) u20) ERR_NOT_AUTHORIZED)
      })
    ))
  )
)

(define-public (add-contribution (project-id uint) (contribution (string-utf8 1000)))
  (let
    (
      (project (unwrap! (map-get? research-projects project-id) ERR_INVALID_PROJECT))
    )
    (asserts! (is-some (index-of (get collaborators project) tx-sender)) ERR_NOT_AUTHORIZED)
    (ok (map-set project-contributions
      { project-id: project-id, contributor: tx-sender }
      {
        contribution: contribution,
        timestamp: block-height
      }
    ))
  )
)

(define-read-only (get-project (project-id uint))
  (map-get? research-projects project-id)
)

(define-read-only (get-contribution (project-id uint) (contributor principal))
  (map-get? project-contributions { project-id: project-id, contributor: contributor })
)

