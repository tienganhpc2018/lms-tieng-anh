/**
 * SCORM 1.2 & SCORM 2004 Runtime API Engine
 * Giả lập và ghi nhận dữ liệu CMI (Computer Managed Instruction) của bài học E-learning
 */

export class ScormEngine {
  constructor(activityId, studentId, onSaveCallback) {
    this.activityId = activityId;
    this.studentId = studentId;
    this.onSaveCallback = onSaveCallback;

    // SCORM 1.2 Data Store
    this.cmiData = {
      'cmi.core.student_id': studentId,
      'cmi.core.student_name': 'Learner',
      'cmi.core.lesson_location': '',
      'cmi.core.lesson_status': 'incomplete', // not attempted, incomplete, completed, passed, failed
      'cmi.core.score.raw': '0',
      'cmi.core.score.min': '0',
      'cmi.core.score.max': '100',
      'cmi.suspend_data': '',
    };

    this.initialized = false;
  }

  // Khởi tạo SCORM 1.2 API
  initSCORM12() {
    const self = this;
    window.API = {
      LMSInitialize: function () {
        self.initialized = true;
        console.log('[SCORM 1.2] LMSInitialize called');
        return 'true';
      },
      LMSGetValue: function (element) {
        console.log(`[SCORM 1.2] LMSGetValue: ${element}`);
        return self.cmiData[element] || '';
      },
      LMSSetValue: function (element, value) {
        console.log(`[SCORM 1.2] LMSSetValue: ${element} = ${value}`);
        self.cmiData[element] = value;
        return 'true';
      },
      LMSCommit: function () {
        console.log('[SCORM 1.2] LMSCommit called');
        if (self.onSaveCallback) {
          self.onSaveCallback({
            status: self.cmiData['cmi.core.lesson_status'],
            score: parseFloat(self.cmiData['cmi.core.score.raw']) || 0,
            tracking_data: self.cmiData,
          });
        }
        return 'true';
      },
      LMSFinish: function () {
        console.log('[SCORM 1.2] LMSFinish called');
        if (self.onSaveCallback) {
          self.onSaveCallback({
            status: self.cmiData['cmi.core.lesson_status'] || 'completed',
            score: parseFloat(self.cmiData['cmi.core.score.raw']) || 0,
            tracking_data: self.cmiData,
          });
        }
        self.initialized = false;
        return 'true';
      },
      LMSGetLastError: function () {
        return '0';
      },
      LMSGetErrorString: function () {
        return 'No error';
      },
      LMSGetDiagnostic: function () {
        return 'No diagnostic';
      },
    };
  }

  // Load dữ liệu cũ đã lưu từ Database vào CMI
  loadSavedData(savedTracking) {
    if (savedTracking && savedTracking.tracking_data) {
      this.cmiData = { ...this.cmiData, ...savedTracking.tracking_data };
    }
  }

  // Hủy đăng ký SCORM API
  destroy() {
    delete window.API;
    delete window.API_1484_11;
  }
}
