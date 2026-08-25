import ErrorHandler from '../../middleware/errorHandler.js';
import { getAuditLogs } from './audit.service.js';

export const getAuditLogsController = async (req, res) => {
  const result = await getAuditLogs({
    organizationId: req.organizationId,
    action: req.query.action,
    projectId: req.query.projectId,
    page: req.query.page,
    limit: req.query.limit,
  });
  if(!result) {
    return next(new ErrorHandler("Failed to Fetch Audit Logs!", 400));
  }
  res.json({ success: true, message: 'Audit logs retrieved', data: result });
};
