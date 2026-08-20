const getChatSpaceId = (department = '') => {
  const dept = String(department || '').toLowerCase();
  if (dept.includes('development') || dept.includes('developer')) return 'space_development';
  if (dept.includes('design')) return 'space_design';
  if (dept.includes('marketing')) return 'space_marketing';
  if (dept.includes('sales')) return 'space_sales';
  if (dept.includes('hr') || dept.includes('human resource') || dept.includes('human resources') || dept.includes('people ops') || dept.includes('people operations') || dept.includes('talent')) return 'space_hr';
  if (dept.includes('success') || dept.includes('client')) return 'space_client_success';
  return 'space_general';
};

const getListText = (items = []) => {
  const normalized = Array.isArray(items)
    ? items.filter((entry) => typeof entry === 'string' && entry.trim())
    : [];
  return normalized.length > 0 ? normalized.join(' • ') : 'No details provided';
};

const createChatPayload = ({ update, user }) => {
  const employeeName = user?.name || update?.employeeName || 'Unknown';
  const projectName = update?.projectName || 'General';
  const priority = update?.priority || 'medium';
  const department = user?.department || update?.department || 'General';
  const niceDate = update?.date
    ? new Date(update.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const blockerCount = Array.isArray(update?.blockers)
    ? update.blockers.filter((blocker) => typeof blocker === 'string' && blocker.trim() && blocker.toLowerCase() !== 'none').length
    : 0;

  const lines = [
    `🧵 Here all **Daily Stand-ups** reports for **${niceDate}**`,
    '',
    `ℹ️ **1 response**`,
    `🔥 **${blockerCount} blocker${blockerCount === 1 ? '' : 's'} or attention point** reported by ${employeeName}`,
    '',
    `*Employee:* ${employeeName}`,
    `*Team / Department:* ${department}`,
    `*Project:* ${projectName}`,
    `*Priority:* ${priority}`,
    '',
    `*Yesterday:* ${getListText(update?.completed)}`,
    `*Today:* ${getListText(update?.working)}`,
    `*Blockers:* ${getListText(update?.blockers)}`,
    '',
    'Please review this update and follow up if any support is needed.',
    '',
    '🚀 MapleBot built-in live report'
  ];

  return {
    text: lines.join('\n')
  };
};

export const createNotificationService = ({ sendGmailMessage, sendChatMessage }) => ({
  async notifyUpdateSubmission({ update, user }) {
    const recipientEmail = user?.email || update?.employeeEmail || 'info@maplelearningsolutions.com';
    const subject = update?.blockers?.some((entry) => String(entry).trim())
      ? `Blocker alert from ${user?.name || update?.employeeName || 'employee'}`
      : `Daily update submitted by ${user?.name || update?.employeeName || 'employee'}`;

    const body = [
      `Hi ${user?.name || update?.employeeName || 'team'},`,
      '',
      'Your daily update has been submitted successfully.',
      '',
      `Project: ${update?.projectName || 'General'}`,
      `Priority: ${update?.priority || 'medium'}`,
      `Yesterday: ${getListText(update?.completed)}`,
      `Today: ${getListText(update?.working)}`,
      `Blockers: ${getListText(update?.blockers)}`,
      '',
      'This update was also shared to the team workspace for follow-up.'
    ].join('\n');

    const chatSpaceId = getChatSpaceId(user?.department || update?.department);

    const chatPayload = createChatPayload({ update, user });

    let emailStatus = 'skipped';
    let chatStatus = 'skipped';

    try {
      if (recipientEmail) {
        await sendGmailMessage({
          senderEmail: 'info@maplelearningsolutions.com',
          to: recipientEmail,
          subject,
          message: body
        });
        emailStatus = 'sent';
      }
    } catch (error) {
      console.warn('Unable to send Gmail notification for update submission:', error);
      emailStatus = 'failed';
    }

    try {
      await sendChatMessage(chatSpaceId, chatPayload);
      chatStatus = 'sent';
    } catch (error) {
      console.warn('Unable to send Google Chat notification for update submission:', error);
      chatStatus = 'failed';
    }

    const deliveryStatus = chatStatus === 'sent' ? 'ok' : emailStatus === 'failed' && chatStatus === 'failed' ? 'failed' : 'partial';

    return {
      deliveryStatus,
      emailStatus,
      chatStatus,
      subject,
      recipientEmail,
      chatSpaceId
    };
  }
});
