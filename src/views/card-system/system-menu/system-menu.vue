<style lang="less">
@import '../../../styles/tree-common.less';
@import './system-menu.less';
</style>
<template>
	<div class="search">
		<Card>
			<Row class="operation">
				<Button @click="addMenu" type="primary" icon="md-add">新增子节点</Button>
				<Button @click="addRootMenu" icon="md-add">新增顶部菜单</Button>
				<Button @click="delAll" icon="md-trash">批量删除</Button>
				<Dropdown @on-click="handleDropdown">
					<Button>
						更多操作
						<Icon type="md-arrow-dropdown"></Icon>
					</Button>
					<DropdownMenu slot="list">
						<DropdownItem name="refresh">刷新</DropdownItem>
						<DropdownItem name="expandOne">收合所有</DropdownItem>
						<DropdownItem name="expandTwo">仅展开一级</DropdownItem>
						<DropdownItem name="expandThree">仅展开两级</DropdownItem>
						<DropdownItem name="expandAll">展开所有</DropdownItem>
					</DropdownMenu>
				</Dropdown>
				<i-switch v-model="strict" size="large" style="margin-left:5px">
					<span slot="open">级联</span>
					<span slot="close">单选</span>
				</i-switch>
			</Row>
			<Row type="flex" justify="start">
				<Col :md="8" :lg="8" :xl="6">
					<Alert show-icon>
						当前选择编辑：
						<span class="select-title">{{editTitle}}</span>
						<a class="select-clear" v-if="form.id" @click="cancelEdit">取消选择</a>
					</Alert>
					<div class="tree-bar" :style="{maxHeight: maxHeight}" style="padding-left:10px;">
						<Tree
							ref="tree"
							:data="data"
							show-checkbox
							:render="renderContent"
							@on-check-change="changeSelect"
							:check-strictly="!strict"
						></Tree>
						<Spin size="large" fix v-if="loading"></Spin>
					</div>
				</Col>
				<Col :md="15" :lg="13" :xl="9" style="margin-left:10px;">
					<Form ref="form" :model="form" :label-width="110" :rules="formValidate">
						<FormItem label="类型" prop="type">
							<div v-show="form.type==0">
								<Icon type="ios-navigate-outline" size="16" style="margin-right:5px;"></Icon>
								<span>顶部菜单</span>
							</div>
							<div v-show="form.type==1">
								<Icon type="ios-list-box-outline" size="16" style="margin-right:5px;"></Icon>
								<span>页面菜单</span>
							</div>
							<div v-show="form.type==2">
								<Icon type="md-radio-button-on" size="16" style="margin-right:5px;"></Icon>
								<span>操作按钮</span>
							</div>
						</FormItem>
						<FormItem label="名称" prop="title" v-if="form.type==0||form.type==1">
							<Input v-model="form.title" />
						</FormItem>
						<FormItem label="名称" prop="title" v-if="form.type==2" class="block-tool">
							<Tooltip placement="right" content="操作按钮名称不得重复">
								<Input v-model="form.title" />
							</Tooltip>
						</FormItem>

						<FormItem label="请求路径" prop="path" v-if="form.type==2" class="block-tool">
							<Tooltip
								placement="right"
								:max-width="230"
								transfer
								content="填写后台请求URL，后台将作权限拦截，若无可填写'无'或其他"
							>
								<Input v-model="form.path" />
							</Tooltip>
						</FormItem>
						<FormItem label="按钮权限类型" prop="buttonType" v-if="form.type==2">
							<Select v-model="form.buttonType" placeholder="请选择或输入搜索" filterable clearable>
								<Option v-for="(item, i) in dictPermissions" :key="i" :value="item.value">{{item.title}}</Option>
							</Select>
						</FormItem>
						<FormItem label="英文名" prop="name" v-if="form.type==0" class="block-tool">
							<Tooltip placement="right" content="需唯一">
								<Input v-model="form.name" />
							</Tooltip>
						</FormItem>
						<FormItem label="路由英文名" prop="name" v-if="form.type==1" class="block-tool">
							<Tooltip placement="right" content="需唯一" transfer>
								<Input v-model="form.name" />
							</Tooltip>
						</FormItem>
						<FormItem label="图标" prop="icon" v-if="form.type==0||form.type==1">
							<icon-choose v-model="form.icon"></icon-choose>
						</FormItem>
						<FormItem label="路径" prop="path" v-if="form.type==1">
							<Input v-model="form.path" />
						</FormItem>
						<FormItem label="前端组件" prop="component" v-if="form.type==1">
							<Input v-model="form.component" />
						</FormItem>
						<FormItem label="URL范例" prop="url" v-if="form.type==1&&form.level==3" class="block-tool">
							<Tooltip placement="right" content="前端组件需为 sys/monitor/monitor 时生效" max-width="300" transfer>
								<Input v-model="form.url" placeholder="http://" @on-change="changeEditUrl" />
							</Tooltip>
						</FormItem>
						<FormItem label="排序值" prop="orders">
							<Tooltip trigger="hover" placement="right" content="值越小越靠前">
								<InputNumber :max="1000" :min="1" v-model="form.orders"></InputNumber>
							</Tooltip>
						</FormItem>
						<FormItem label="始终显示" prop="showAlways" v-if="form.level==2" class="block-tool">
							<i-switch size="large" v-model="form.showAlways">
								<span slot="open">是</span>
								<span slot="close">否</span>
							</i-switch>
							<Tooltip
								content="当设为不始终显示时，一级菜单下仅有一个子级菜单只会显示该子级菜单，避免用户多次点击"
								placement="right"
								transfer
								max-width="280"
								style="display: inline-block !important;"
							>
								<Icon
									type="md-help-circle"
									size="20"
									color="#c5c5c5"
									style="margin-left:10px;cursor:pointer;"
								/>
							</Tooltip>
						</FormItem>
						<FormItem label="是否启用" prop="statusCode">
							<i-switch size="large" v-model="form.statusCode" :true-value="0" :false-value="-1">
								<span slot="open">启用</span>
								<span slot="close">禁用</span>
							</i-switch>
						</FormItem>
						<Form-item>
							<Button
								style="margin-right:5px"
								@click="submitEdit"
								:loading="submitLoading"
								type="primary"
								icon="ios-create-outline"
							>编辑并保存</Button>
							<Button @click="handleReset">重置</Button>
						</Form-item>
					</Form>
				</Col>
			</Row>
		</Card>
		<!-- 新增节点 -->
		<Modal :title="modalTitle" v-model="menuModalVisible" :mask-closable="false" :width="500">
			<Form ref="formAdd" :model="formAdd" :label-width="100" :rules="formValidate">
				<div v-if="showParent">
					<FormItem label="上级节点：">{{parentTitle}}</FormItem>
				</div>
				<FormItem label="类型" prop="type">
					<div v-show="formAdd.type==0">
						<Icon type="ios-navigate-outline" size="16" style="margin-right:5px;"></Icon>
						<span>顶部菜单</span>
					</div>
					<div v-show="formAdd.type==1">
						<Icon type="ios-list-box-outline" size="16" style="margin-right:5px;"></Icon>
						<span>页面菜单</span>
					</div>
					<div v-show="formAdd.type==2">
						<Icon type="md-radio-button-on" size="16" style="margin-right:5px;"></Icon>
						<span>操作按钮</span>
					</div>
				</FormItem>
				<FormItem label="名称" prop="title" v-if="formAdd.type==0||formAdd.type==1">
					<Input v-model="formAdd.title" />
				</FormItem>
				<FormItem label="名称" prop="title" v-if="formAdd.type==2" class="block-tool">
					<Tooltip placement="right" content="操作按钮名称不得重复">
						<Input v-model="formAdd.title" />
					</Tooltip>
				</FormItem>
				<FormItem label="路径" prop="path" v-if="formAdd.type==1">
					<Input v-model="formAdd.path" />
				</FormItem>
				<FormItem label="请求路径" prop="path" v-if="formAdd.type==2" class="block-tool">
					<Tooltip placement="right" :max-width="230" transfer content="填写后台请求URL，后台将作权限拦截，若无可填写'无'或其他">
						<Input v-model="formAdd.path" />
					</Tooltip>
				</FormItem>
				<FormItem label="按钮权限类型" prop="buttonType" v-if="formAdd.type==2">
					<Select v-model="formAdd.buttonType" placeholder="请选择或输入搜索" filterable clearable>
						<Option v-for="(item, i) in dictPermissions" :key="i" :value="item.value">{{item.title}}</Option>
					</Select>
				</FormItem>
				<FormItem label="英文名" prop="name" v-if="formAdd.type==0" class="block-tool">
					<Tooltip placement="right" content="需唯一">
						<Input v-model="formAdd.name" />
					</Tooltip>
				</FormItem>
				<FormItem label="路由英文名" prop="name" v-if="formAdd.type==1" class="block-tool">
					<Tooltip placement="right" content="需唯一">
						<Input v-model="formAdd.name" />
					</Tooltip>
				</FormItem>
				<FormItem label="图标" prop="icon" v-if="formAdd.type==0||formAdd.type==1">
					<icon-choose v-model="formAdd.icon"></icon-choose>
				</FormItem>
				<FormItem label="前端组件" prop="component" v-if="formAdd.type==1">
					<Input v-model="formAdd.component" />
				</FormItem>
				<FormItem label="第三方链接" prop="url" v-if="formAdd.type==1&&formAdd.level==3" class="block-tool">
					<Tooltip placement="right" content="前端组件需为 sys/monitor/monitor 时生效" max-width="300" transfer>
						<Input v-model="formAdd.url" placeholder="http://" @on-change="changeAddUrl" />
					</Tooltip>
				</FormItem>
				<FormItem label="排序值" prop="orders">
					<Tooltip trigger="hover" placement="right" content="值越小越靠前">
						<InputNumber :max="1000" :min="1" v-model="formAdd.orders"></InputNumber>
					</Tooltip>
				</FormItem>
				<FormItem label="始终显示" prop="showAlways" v-if="formAdd.level==2" class="block-tool">
					<i-switch size="large" v-model="formAdd.showAlways">
						<span slot="open">是</span>
						<span slot="close">否</span>
					</i-switch>
					<Tooltip
						content="当设为不始终显示时，一级菜单下仅有一个子级菜单只会显示该子级菜单，避免用户多次点击"
						placement="right"
						transfer
						max-width="280"
						style="display: inline-block !important;"
					>
						<Icon
							type="md-help-circle"
							size="20"
							color="#c5c5c5"
							style="margin-left:10px;cursor:pointer;"
						/>
					</Tooltip>
				</FormItem>
				<FormItem label="是否启用" prop="statusCode">
					<i-switch size="large" v-model="formAdd.statusCode" :true-value="1" :false-value="0">
						<span slot="open">启用</span>
						<span slot="close">禁用</span>
					</i-switch>
				</FormItem>
			</Form>
			<div slot="footer">
				<Button type="text" @click="menuModalVisible = false">取消</Button>
				<Button type="primary" :loading="submitLoading" @click="submitAdd">提交</Button>
			</div>
		</Modal>
	</div>
</template>

<script>
import {
	getPermissionList,
	createMenu,
	updateMenu
} from '@/api/card-system-api';
import IconChoose from '@/views/my-components/xboot/icon-choose';
import util from '@/libs/util.js';
export default {
	name: 'SysMenu',
	components: {
		IconChoose
	},
	data() {
		return {
			loading: true,
			strict: true,
			maxHeight: '500px',
			expandLevel: 1,
			menuModalVisible: false,
			iconModalVisible: false,
			selectList: [],
			selectCount: 0,
			showParent: false,
			parentTitle: '',
			editTitle: '',
			modalTitle: '',
			form: {
				id: '',
				title: '',
				name: '',
				icon: '',
				path: '',
				component: '',
				parentId: '',
				buttonType: '',
				type: 0,
				orders: 1,
				level: 1,
				statusCode: 0,
				url: '',
				showAlways: true
			},
			formAdd: {
				buttonType: ''
			},
			formValidate: {
				title: [
					{
						required: true,
						message: '名称不能为空',
						trigger: 'blur'
					}
				],
				name: [
					{
						required: true,
						message: '路由英文名不能为空',
						trigger: 'blur'
					}
				],
				icon: [
					{
						required: true,
						message: '图标不能为空',
						trigger: 'click'
					}
				],
				path: [
					{
						required: true,
						message: '路径不能为空',
						trigger: 'blur'
					}
				],
				component: [
					{
						required: true,
						message: '前端组件不能为空',
						trigger: 'blur'
					}
				],
				orders: [
					{
						required: true,
						type: 'number',
						message: '排序值不能为空',
						trigger: 'blur'
					}
				]
			},
			submitLoading: false,
			data: [],
			dictPermissions: [
				{
					title: '查看操作(view)',
					value: 'view'
				},
				{
					title: '新增操作(add)',
					value: 'add'
				},
				{
					title: '编辑操作(edit)',
					value: 'edit'
				},
				{
					title: '删除操作(delete)',
					value: 'delete'
				},
				{
					title: '清空操作(clear)',
					value: 'clear'
				},
				{
					title: '启用操作(enable)',
					value: 'enable'
				},
				{
					title: '禁用操作(disable)',
					value: 'disable'
				},
				{
					title: '搜索操作(search)',
					value: 'search'
				},
				{
					title: '上传文件(upload)',
					value: 'upload'
				},
				{
					title: '导出操作(output)',
					value: 'output'
				},
				{
					title: '导入操作(input)',
					value: 'input'
				}
			]
		};
	},
	methods: {
		init() {
			this.getAllList();
		},
		renderContent(h, { root, node, data }) {
			let icon = '';
			if (data.level == 1) {
				icon = 'ios-navigate';
			} else if (data.level == 2) {
				icon = 'md-list-box';
			} else if (data.level == 3) {
				icon = 'md-list';
			} else if (data.level == 4) {
				icon = 'md-radio-button-on';
			} else {
				icon = 'md-radio-button-off';
			}
			return h(
				'span',
				{
					style: {
						display: 'inline-block',
						cursor: 'pointer'
					},
					on: {
						click: () => {
							this.selectTree(data);
						}
					}
				},
				[
					h('span', [
						h('Icon', {
							props: {
								type: icon,
								size: '16'
							},
							style: {
								'margin-right': '8px',
								'margin-bottom': '3px'
							}
						}),
						h(
							'span',
							{
								class: {
									'ivu-tree-title': true,
									'ivu-tree-title-selected':
										data.id == this.form.id
								}
							},
							data.title
						)
					])
				]
			);
		},
		handleDropdown(name) {
			if (name == 'expandOne') {
				this.expandLevel = 1;
				this.getAllList();
			} else if (name == 'expandTwo') {
				this.expandLevel = 2;
				this.getAllList();
			} else if (name == 'expandThree') {
				this.expandLevel = 3;
				this.getAllList();
			}
			if (name == 'expandAll') {
				this.expandLevel = 4;
				this.getAllList();
			} else if (name == 'refresh') {
				this.getAllList();
			}
		},
		getAllList() {
			this.loading = true;
			let params = {
				levelId: 1,
				pageNumber: 1,
				pageSize: 9999
			};
			getPermissionList(params).then(res => {
				if (res.success) {
					let datas = res.result;
					let menus = [];
					datas.content.forEach(e => {
						let item = {
							id: e.permissionId,
							parentId: e.pid,
							name: e.vueName,
							showAlways: e.showAlways,
							level: e.level,
							type: e.vueType,
							title: e.permissionName,
							path: e.vuePath,
							component: e.vueComponent,
							icon: e.icon,
							url: e.urlPattern,
							buttonType: e.buttontype,
							permTypes: e.permtypes,
							description: e.description,
							statusCode: e.statusCode,
							expand: false,
							checked: false
						};
						menus.push(item);
					});
					let menuData = this.globalUtil.listConvertTreeData(
						menus,
						'id',
						'parentId',
						'children'
					);
					// 仅展开指定级数 默认后台已展开所有
					let expandLevel = this.expandLevel;
					menuData.forEach(function(e) {
						if (expandLevel == 1) {
							if (e.level == 1) {
								e.expand = false;
							}
							if (e.children && e.children.length > 0) {
								e.children.forEach(function(c) {
									if (c.level == 2) {
										c.expand = false;
									}
									if (c.children && c.children.length > 0) {
										c.children.forEach(function(b) {
											if (b.level == 3) {
												b.expand = false;
											}
										});
									}
								});
							}
						} else if (expandLevel == 2) {
							if (e.level == 1) {
								e.expand = true;
							}
							if (e.children && e.children.length > 0) {
								e.children.forEach(function(c) {
									if (c.level == 2) {
										c.expand = false;
									}
									if (c.children && c.children.length > 0) {
										c.children.forEach(function(b) {
											if (b.level == 3) {
												b.expand = false;
											}
										});
									}
								});
							}
						} else if (expandLevel == 3) {
							if (e.level == 1) {
								e.expand = true;
							}
							if (e.children && e.children.length > 0) {
								e.children.forEach(function(c) {
									if (c.level == 2) {
										c.expand = true;
									}
									if (c.children && c.children.length > 0) {
										c.children.forEach(function(b) {
											if (b.level == 3) {
												b.expand = false;
											}
										});
									}
								});
							}
						}
					});
					this.loading = false;
					this.data = menuData;
				}
			});
		},
		selectTree(v) {
			if (v && v.id != this.form.id) {
				for (let attr in v) {
					if (v[attr] == null) {
						v[attr] = '';
					}
				}
				let str = JSON.stringify(v);
				let menu = JSON.parse(str);
				this.form = menu;
				this.editTitle = menu.title;
			} else {
				this.cancelEdit();
			}
		},
		cancelEdit() {
			let data = this.$refs.tree.getSelectedNodes()[0];
			if (data) {
				data.selected = false;
			}
			this.$refs.form.resetFields();
			this.form.id = '';
			this.editTitle = '';
		},
		handleReset() {
			let type = this.form.type;
			this.$refs.form.resetFields();
			this.form.icon = '';
			this.form.component = '';
			this.form.type = type;
		},
		submitEdit() {
			this.$refs.form.validate(valid => {
				if (valid) {
					if (!this.form.id) {
						this.$Msg.warning('请先选择要修改的菜单');
						return;
					}
					this.submitLoading = true;
					if (this.form.orders == null) {
						this.form.orders = '';
					}
					if (this.form.buttonType == null) {
						this.form.buttonType = '';
					}
					if (this.form.type == 2) {
						this.form.name = '';
						this.form.icon = '';
						this.form.component = '';
					}
					if (this.form.level != 2) {
						this.form.showAlways = true;
					}
					let para = {
						buttontype: this.form.buttonType,
						vueComponent: this.form.component,
						vueName: this.form.name,
						vuePath: this.form.path,
						vueShowAlways: this.form.showAlways,
						permissionId: this.form.id,
						permissionName: this.form.title,
						urlPattern: this.form.url,
						orders: this.form.orders,
						icon: this.form.icon
					};
					updateMenu(para).then(res => {
						this.submitLoading = false;
						if (res.success) {
							this.$Msg.success('编辑成功');
							this.$store.commit('setAdded', false);
							util.initRouter(this);
							this.init();
							this.menuModalVisible = false;
						}
					});
				}
			});
		},
		submitAdd() {
			this.$refs.formAdd.validate(valid => {
				if (valid) {
					this.submitLoading = true;
					if (this.formAdd.type == 2) {
						this.formAdd.name = '';
						this.formAdd.icon = '';
						this.formAdd.component = '';
					}
					if (this.formAdd.type == 0) {
						let para = {
							appId: -1,
							argCount: 0,
							buttontype: '',
							levelId: 1,
							level: this.formAdd.level,
							permtypes: '',
							vueComponent: 'Default',
							vueName: this.formAdd.name,
							vuePath: 'Default',
							vueShowAlways: true,
							vueType: 0,
							permissionName: this.formAdd.title,
							permissionPattern: 'api',
							urlPattern: '/api/url',
							pid: 0,
							orders: this.formAdd.orders,
							icon: this.formAdd.icon
						};
						createMenu(para).then(res => {
							this.submitLoading = false;
							if (res.success) {
								this.$Msg.success('新增成功');
								this.$store.commit('setAdded', false);
								util.initRouter(this);
								this.init();
								this.menuModalVisible = false;
							}
						});
					}
					if (this.formAdd.type == 1) {
						let para = {
							appId: -1,
							argCount: 0,
							buttontype: '',
							levelId: 1,
							permtypes: '',
							vueShowAlways: true,
							vueType: 1,
							permissionPattern: 'api',
							urlPattern: '/api/url',
							pid: this.formAdd.parentId,
							permissionName: this.formAdd.title,
							vuePath: this.formAdd.path,
							vueName: this.formAdd.name,
							icon: this.formAdd.icon,
							vueComponent: this.formAdd.component,
							orders: this.formAdd.orders,
							vueShowAlways: this.form.showAlways,
							statusCode: this.formAdd.statusCode
						};
						createMenu(para).then(res => {
							this.submitLoading = false;
							if (res.success) {
								this.$Msg.success('新增成功');
								this.$store.commit('setAdded', false);
								util.initRouter(this);
								this.init();
								this.menuModalVisible = false;
							}
						});
					}
					if (this.formAdd.type == 2) {
						let para = {
							appId: -1,
							argCount: 0,
							buttontype: '',
							levelId: 1,
							permtypes: '',
							vueShowAlways: true,
							vueType: 2,
							permissionPattern: 'api',
							urlPattern: '/api/url',
							pid: this.formAdd.parentId,
							permissionName: this.formAdd.title,
							vuePath: this.formAdd.path,
							vueName: this.formAdd.name,
							icon: this.formAdd.icon,
							vueComponent: this.formAdd.component,
							orders: this.formAdd.orders,
							vueShowAlways: this.form.showAlways,
							statusCode: this.formAdd.statusCode
						};
						createMenu(para).then(res => {
							this.submitLoading = false;
							if (res.success) {
								this.$Msg.success('新增成功');
								this.$store.commit('setAdded', false);
								util.initRouter(this);
								this.init();
								this.menuModalVisible = false;
							}
						});
					}
				}
			});
		},
		changeEditUrl(e) {
			let v = e.target.value;
			if (v.indexOf('http') > -1) {
				this.form.component = 'sys/monitor/monitor';
			}
		},
		changeAddUrl(e) {
			let v = e.target.value;
			if (v.indexOf('http') > -1) {
				this.formAdd.component = '';
			}
		},
		addMenu() {
			if (!this.form.id) {
				this.$Msg.warning('请先点击选择一个菜单权限节点');
				return;
			}
			this.parentTitle = this.form.title;
			this.modalTitle = '新增菜单子节点';
			this.showParent = true;
			let type = 1;
			if (this.form.level == 1) {
				type = 1;
			} else if (this.form.level == 2) {
				type = 1;
			} else if (this.form.level == 3) {
				this.$Msg.warning('仅支持2级菜单目录');
				return;
			} else {
				type = 1;
			}
			let component = '';
			this.formAdd = {
				icon: '',
				type: type,
				parentId: this.form.id,
				level: Number(this.form.level) + 1,
				orders: 1,
				buttonType: '',
				statusCode: 0,
				showAlways: true
			};
			if (this.form.level == 1) {
				this.formAdd.path = '/';
				this.formAdd.component = 'Main';
			}
			this.menuModalVisible = true;
		},
		addRootMenu() {
			this.modalTitle = '新增顶部菜单';
			this.showParent = false;
			this.formAdd = {
				type: 0,
				level: 1,
				orders: 1,
				statusCode: 1
			};
			this.menuModalVisible = true;
		},
		changeSelect(v) {
			this.selectCount = v.length;
			this.selectList = v;
		},
		delAll() {
			if (this.selectCount <= 0) {
				this.$Msg.warning('您还未勾选要删除的数据');
				return;
			}
			let ids = '';
			this.selectList.forEach(function(e) {
				ids += e.id + ',';
			});
			ids = ids.substring(0, ids.length - 1);
			this.selectList = [];
			this.selectCount = 0;
			this.cancelEdit();
			this.init();
			this.$Msg.warning('大佬，不能删除啊');
		}
	},
	mounted() {
		// 计算高度
		let height = document.documentElement.clientHeight;
		this.maxHeight = Number(height - 287) + 'px';
		this.init();
	}
};
</script>
