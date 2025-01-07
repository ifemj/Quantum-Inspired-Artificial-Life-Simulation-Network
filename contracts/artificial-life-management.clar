;; Artificial Life Management Contract

(define-data-var life-form-count uint u0)

(define-map life-forms
  uint
  {
    creator: principal,
    genome: (buff 64),
    energy: uint,
    generation: uint,
    last-update: uint
  }
)

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u403))
(define-constant ERR_INVALID_LIFE_FORM (err u404))

(define-public (create-life-form (genome (buff 64)))
  (let
    (
      (life-form-id (+ (var-get life-form-count) u1))
    )
    (map-set life-forms
      life-form-id
      {
        creator: tx-sender,
        genome: genome,
        energy: u100,
        generation: u1,
        last-update: block-height
      }
    )
    (var-set life-form-count life-form-id)
    (ok life-form-id)
  )
)

(define-public (update-life-form (life-form-id uint) (new-genome (buff 64)) (energy-delta int))
  (let
    (
      (life-form (unwrap! (map-get? life-forms life-form-id) ERR_INVALID_LIFE_FORM))
      (current-energy (get energy life-form))
    )
    (asserts! (is-eq tx-sender (get creator life-form)) ERR_NOT_AUTHORIZED)
    (map-set life-forms
      life-form-id
      (merge life-form
        {
          genome: new-genome,
          energy: (if (> energy-delta 0)
                      (+ current-energy (to-uint energy-delta))
                      (if (>= current-energy (to-uint (- 0 energy-delta)))
                          (- current-energy (to-uint (- 0 energy-delta)))
                          u0)),
          last-update: block-height
        }
      )
    )
    (ok true)
  )
)

(define-read-only (get-life-form (life-form-id uint))
  (map-get? life-forms life-form-id)
)

(define-read-only (get-life-form-count)
  (var-get life-form-count)
)

