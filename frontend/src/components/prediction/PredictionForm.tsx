import React, { useEffect } from 'react';
import { Form, Input, Button, Card } from 'antd';

const { TextArea } = Input;

interface PredictionFormProps {
  onPredict: (data: any) => void;
}

const PredictionForm: React.FC<PredictionFormProps> = ({ onPredict }) => {
  const [form] = Form.useForm();

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('echelper_prediction_form');
    if (savedData) {
      try {
        const formData = JSON.parse(savedData);
        form.setFieldsValue(formData);
      } catch (error) {
        console.error('Failed to load saved form data:', error);
      }
    }
  }, [form]);

  // Save form data to localStorage whenever it changes
  const handleValuesChange = (_: any, allValues: any) => {
    try {
      localStorage.setItem('echelper_prediction_form', JSON.stringify(allValues));
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  };

  const handleSubmit = (values: any) => {
    onPredict(values);
  };

  const handleClear = () => {
    form.resetFields();
    // Clear localStorage when form is cleared
    localStorage.removeItem('echelper_prediction_form');
  };

  return (
    <Card title="입력 정보"
      bodyStyle={{ padding: 10 }}>
      <Form
        form={form}
        layout="vertical"
        className="compact-form"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
      >
        <Form.Item style={{ marginTop: 0 }}
          label="Title"
          name="title"
          rules={[{ required: true, message: '제목을 입력하세요' }]}
        >
          <Input 
            placeholder="Enter item title" 
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: '상세 설명을 입력하세요' }]}
        >
          <TextArea 
            rows={6} 
            placeholder="Enter detailed description"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Purpose"
          name="purpose"
        >
          <TextArea 
            rows={3} 
            placeholder="Enter purpose (optional)"
            size="large"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 14 }}
          label="Application"
          name="application"
        >
          <Input 
            placeholder="Enter application (optional)"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              style={{ flex: 1 }}
            >
              🔍 예측 및 유사이력 검색
            </Button>
            <Button 
              onClick={handleClear}
              size="large"
            >
              초기화
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PredictionForm;