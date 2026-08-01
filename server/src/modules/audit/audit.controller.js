import { getAuditLogs } from './audit.service.js';

export const getAuditLogsController = async (req, res) => {
  const result = await getAuditLogs({
    userId: req.query.userId,
    action: req.query.action,
    projectId: req.query.projectId,
    page: req.query.page,
    limit: req.query.limit,
  });

  res.json({ success: true, message: 'Audit logs retrieved', data: result });
};
