import frappe
from frappe.utils.background_jobs import get_job

def is_deletion_job_running(company):
    job_id = generate_id_for_deletion_job(company)
    job = get_job(job_id)
    if job:
        job_name = job.get_id()
        frappe.throw(
            _("A Transaction Deletion Job: {0} is already running for {1}").format(
                frappe.bold(frappe.get_doc("RQ Job", job_name).get_route()), frappe.bold(company)
            )
        )
    else:
        frappe.msgprint(_("No deletion job found for {0}.").format(frappe.bold(company)))
