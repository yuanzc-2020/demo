<template>
	<div>
		<Modal
			:title="applyTitle"
			v-model="applyModalVisible"
			:mask-closable="false"
			:width="600"
			:styles="{top: '30px'}"
		>
			<Form ref="form" :model="form" :label-width="100" :rules="formValidate">
				<FormItem label="后续环节">
					<Tag size="large" type="dot" color="success">{{this.firstNodeTitle}}</Tag>
				</FormItem>
				<FormItem label="流程标题" prop="title">
					<Input
						type="textarea"
						v-model="form.title"
						:autosize="{ minRows: 2, maxRows: 2 }"
						placeholder="请输入标题，建议：分公司+申请人+申请事项"
						clearable
						maxlength="60"
						show-word-limit
					/>
				</FormItem>
				<FormItem label="处理意见" prop="comment" v-if="showComment">
					<Input
						type="textarea"
						v-model="form.comment"
						:autosize="{ minRows: 2, maxRows: 2 }"
						placeholder="请输入处理意见"
						maxlength="150"
						show-word-limit
					/>
				</FormItem>
				<FormItem label="处理人" prop="assignees" :error="error">
					<Select
						v-model="form.assignees"
						placeholder="请选择或输入搜索"
						filterable
						:label-in-value="labelinvalue"
						clearable
						multiple
						:loading="userLoading"
						@on-change="getAssigneesList"
					>
						<Option
							v-for="(item, i) in assigneeList"
							:key="i"
							:value="item.userId"
						>{{ item.userName }}（{{item.corpName}}）</Option>
					</Select>
				</FormItem>
				<FormItem label="优先级" prop="priority">
					<Select v-model="form.priority" placeholder="请选择" clearable>
						<Option v-for="(item, i) in dictPriority" :key="i" :value="item.value">{{ item.title }}</Option>
					</Select>
				</FormItem>
				<FormItem label="消息通知">
					<Checkbox v-model="form.sendMessage">站内消息通知</Checkbox>
					<Checkbox disabled v-model="form.sendSms">短信通知</Checkbox>
					<!-- <Checkbox v-model="form.sendEmail">邮件通知</Checkbox>  -->
				</FormItem>
				<Row :gutter="16">
					<Col span="12"></Col>
					<Col span="12"></Col>
				</Row>
			</Form>
			<div slot="footer">
				<Button type="text" @click="applyModalVisible = false">取消</Button>
				<Button type="primary" :loading="submitLoading" @click="handelSubmit">提交</Button>
			</div>
		</Modal>
	</div>
</template>
<script>
import {
	getProcessByKey,
	getFirstNode,
	startApplyTask
} from '@/api/card-flow-api';
export default {
	name: 'ProcessStart',
	props: {},
	data() {
		return {
			labelinvalue: true,
			showComment: false,
			userLoading: false,
			error: '',
			submitLoading: false,
			applyModalVisible: false,
			firstNodeTitle: '',
			applyTitle: '',
			form: {
				businessId: '',
				businessKey: '',
				title: '',
				comment: '',
				procDefId: '',
				assignees: [],
				priority: 0,
				sendMessage: true,
				sendSms: false,
				sendEmail: false
			},
			formValidate: {
				title: [
					{
						required: true,
						message: '不能为空',
						trigger: 'blur'
					}
				],
				comment: [
					{
						required: true,
						message: '不能为空',
						trigger: 'blur'
					}
				],
				priority: [
					{
						type: 'number',
						required: true,
						message: '不能为空',
						trigger: 'blur'
					}
				]
			},
			assigneeList: [],
			assignRoleList: [],
			dictPriority: this.$store.state.dict.priority,
			routeName: '',
			sendMessageUsers: []
		};
	},
	methods: {
		init() {},
		showApply() {
			if (this.routeName == '') {
				this.$Msg.warning(
					'该流程信息未完善，请于流程管理中编辑流程完善信息'
				);
				return;
			}
			// 获取第一个审批节点，加载审批人(根据userIds和roleIds)
			this.userLoading = true;
			getFirstNode(this.form.procDefId).then(res => {
				this.userLoading = false;
				if (res.success) {
					this.firstNodeTitle = res.result.title;
					let userLists = res.result.userList;
					this.assigneeList = userLists;
					this.applyModalVisible = true;
				}
			});
		},
		handelSubmit() {
			this.$refs.form.validate(valid => {
				if (valid) {
					if (this.form.assignees.length < 1) {
						this.error = '请至少选择一个审批人';
						return;
					} else {
						this.error = '';
					}
					this.submitLoading = true;
					let paras = {
						assignees: this.form.assignees,
						businessId: this.form.businessId,
						businessKey: this.form.businessKey,
						priority: this.form.priority,
						procDefId: this.form.procDefId,
						sendEmail: this.form.sendEmail,
						sendMessage: this.form.sendMessage,
						sendSms: this.form.sendSms,
						title: this.form.title
					};
					startApplyTask(paras).then(res => {
						this.submitLoading = false;
						if (res.success) {
							this.$Msg.success('流程提交成功');
							this.applyModalVisible = false;
							this.$emit('processSubmitCallBack');
							this.routeName = '';
							//发送消息
							let types = {
								sendEmail: this.form.sendEmail,
								sendMessage: this.form.sendMessage,
								sendSms: this.form.sendSms
							};
							let messageParas = {
								content:
									'您有一个工作流程【' +
									this.form.title +
									'】待审核，赶快去《我的待办》处理吧',
								title: '您有新的工作流程订单，请及时处理！',
								type: '工作流',
								users: this.sendMessageUsers
							};
							this.handleSystemMethods.commSendMessage(
								types,
								messageParas
							);
						}
					});
				}
			});
		},
		getAssigneesList(val) {
			this.sendMessageUsers = [];
			val.forEach(element => {
				this.sendMessageUsers.push({
					userId: element.value,
					userName: element.label
				});
			});
		},
		show(flowKey, businessKey, businessId) {
			if (!flowKey) {
				this.$Msg.warning('无效流程KEY');
				return;
			}
			if (!businessId) {
				this.$Msg.warning('无效业务编号');
				return;
			}
			if (!businessKey) {
				this.$Msg.warning('无效业务KEY');
				return;
			}
			this.$refs.form.resetFields();
			this.form.businessId = businessId;
			this.form.businessKey = businessKey;
			this.$emit('on-loading', true);
			getProcessByKey(flowKey).then(res => {
				this.$emit('on-loaded', false);
				if (res.success) {
					this.routeName = res.result.routeName;
					this.form.procDefId = res.result.procDefId;
					//this.form.title = res.result.name;
					this.applyTitle =
						res.result.name + '：提交流程（' + businessId + '）';
					this.showApply();
				}
			});
		},
		close() {
			this.applyModalVisible = false;
		}
	},
	created() {
		this.init();
	}
};
</script>

<style lang="less"></style>
